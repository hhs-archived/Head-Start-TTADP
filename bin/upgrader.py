#!/usr/bin/env python3

import json
import subprocess
import shutil
import os
import itertools
import time
import requests
import json

def refactor_data(json_data):
    # Parse the JSON data
    data = json.loads(json_data)

    # Extract the header and body from the data
    header = data['data']['head']
    body = data['data']['body']

    # Refactor the data into an array of objects
    refactored_data = []
    for row in body:
        obj = {}
        for i, value in enumerate(row):
            obj[header[i]] = value

        # Add the delta attribute
        current_version = obj['Current']
        latest_version = obj['Latest']
        delta = get_delta(current_version, latest_version)
        obj['WantedDelta'] = delta
        latest_version = obj['Latest']
        delta = get_delta(current_version, latest_version)
        obj['LatestDelta'] = delta

        refactored_data.append(obj)

    return refactored_data


def get_delta(current_version, latest_version):
    # Logic to determine the delta portion (major, minor, patch)
    if current_version == latest_version:
        return 'None'
    elif current_version.split('.')[0] != latest_version.split('.')[0]:
        return 'Major'
    elif current_version.split('.')[1] != latest_version.split('.')[1]:
        return 'Minor'
    else:
        return 'Patch'

def group_by_wanted_delta(objects):
    # Sort the objects by the "WantedDelta" attribute
    sorted_objects = sorted(objects, key=lambda obj: obj['WantedDelta'])

    # Group the objects by the "WantedDelta" attribute
    grouped_objects = {}
    for key, group in itertools.groupby(sorted_objects, key=lambda obj: obj['WantedDelta']):
        grouped_objects[key] = list(group)

    return grouped_objects



# Read the package.json file
try:
    with open('package.json') as file:
        package_json = json.load(file)
except FileNotFoundError:
    print("Error: package.json file not found")
    exit(1)

# Get the dependency types to group the outdated packages
dependency_types = ['dependencies', 'devDependencies']  # Add more if needed

# Iterate over the dependency types
for dependency_type in dependency_types:
    try:
        # Get the outdated packages for the current dependency type
        try:
            outdated_output = subprocess.run(['yarn', 'outdated', '--json'], env=os.environ, cwd=os.getcwd(), capture_output=True)
        except subprocess.CalledProcessError as e:
            print("Error: Failed to get outdated packages.")
            print(e)
            print(os.getcwd())
            continue
        outdated_json = outdated_output.stdout.decode().split('\n')[1]
        outdated_packages = refactor_data(outdated_json)
        outdated_groups = group_by_wanted_delta(outdated_packages)

        # Group the outdated packages by the combination of WantedDelta and package name prefix
        grouped_packages = {}
        for package_name, package_info_list in outdated_groups.items():
            for package_info in package_info_list:
                wanted_delta = package_info['LatestDelta']
                prefix = package_name.split('-')[0]  # Assuming package names have a hyphen separator

                key = (wanted_delta, prefix)
                if key not in grouped_packages:
                    grouped_packages[key] = []

                grouped_packages[key].append(package_info)

        # Iterate over the grouped packages
        for group_key, package_info_list in grouped_packages.items():
            wanted_delta, prefix = group_key

            # Check if the group has a Patch delta
            if wanted_delta == 'Patch':
                # Extract the latest version from the first package in the group
                package_info = package_info_list[0]
                package_name = package_info['Package']
                current_version = package_info['Current']
                latest_version = package_info['Latest']

                print(f"Updating {package_name} (current version: {current_version}, latest version: {latest_version})...")

                # Update the dependency to the latest version
                try:
                    update_process = subprocess.run(['yarn', 'upgrade', f"{package_name}@{latest_version}"], capture_output=True, text=True, check=True)
                except subprocess.CalledProcessError as e:
                    print(f"Error: Failed to update {package_name}.")
                    continue

                # Run tests and handle test results
                try:
                    # Push the changes to GitHub
                    subprocess.run(['git', 'push'], check=True)

                    # Trigger a new CircleCI pipeline
                    response = requests.post('https://circleci.com/api/v2/project/Head-Start-TTADP/pipeline', headers={'Circle-Token': os.environ['CIRCLECI_AUTH_TOKEN']})

                    if response.status_code == 201:
                        pipeline_data = response.json()
                        pipeline_id = pipeline_data['id']
                        print(f"CircleCI pipeline triggered for {package_name}. Pipeline ID: {pipeline_id}")

                        # Wait for CircleCI build success or failure
                        print("Waiting for CircleCI build...")
                        while True:
                            time.sleep(10)  # Wait for 10 seconds before checking the build status
                            response = requests.get(f"https://circleci.com/api/v2/pipeline/{pipeline_id}/workflow")
                            if response.status_code == 200:
                                workflow_data = response.json()
                                last_workflow = workflow_data['items'][0]
                                status = last_workflow['status']
                                if status == 'success':
                                    print(f"CircleCI build succeeded for {package_name}.")
                                    break
                                elif status == 'failed':
                                    print(f"CircleCI build failed for {package_name}. Reverting update...")
                                    subprocess.run(['yarn', 'add', f"{package_name}@{current_version}"])

                                    # Revert changes in package.json
                                    package_json[dependency_type][package_name] = current_version

                                    # Discard changes in the working directory
                                    subprocess.run(['git', 'checkout', '--', 'package.json'])
                                    break
                                else:
                                    print("CircleCI build still in progress...")
                            else:
                                print("Failed to get CircleCI workflow data.")
                                break
                    else:
                        print("Failed to trigger CircleCI pipeline.")
                except subprocess.CalledProcessError as e:
                    print(f"Error: Failed to commit and push the changes for {package_name}.")
                    print(e)
                    continue





    except FileNotFoundError as e:
        print("Error: git command not found")
        print(e)
        exit(1)
    except subprocess.CalledProcessError as e:
        print("Error: An error occurred while executing a git command")
        print(e)
        exit(1)
