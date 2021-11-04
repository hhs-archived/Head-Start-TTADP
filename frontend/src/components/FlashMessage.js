import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faExclamation } from '@fortawesome/free-solid-svg-icons';
import './FlashMessage.css';
import LLAMA_HEAD_IMAGE from '../images/llama_head.png';
import { FLASH_MESSAGE_TYPES } from '../Constants';

const determineImage = (type) => {
  if (type === FLASH_MESSAGE_TYPES.SUCCESS) {
    return (<FontAwesomeIcon className="center-flash-image padding-top-2" size="3x" color="#4fbe82" icon={faCheck} />);
  }

  if (type === FLASH_MESSAGE_TYPES.CELEBRATE) {
    return (<img className="center-flash-image" src={LLAMA_HEAD_IMAGE} width="64" height="115" alt="llama_message Logo" />);
  }

  if (type === FLASH_MESSAGE_TYPES.ERROR) {
    return (<FontAwesomeIcon className="center-flash-image padding-top-2" size="3x" color="#4fbe82" icon={faExclamation} />);
  }

  return null;
};

const FlashMessage = ({ message, type }) => (
  <div className={`z-top flash-message flash-message-type-${type}`}>
    <div className={`flash-message-tab flash-message-tab-type-${type}`}>
      { determineImage(type) }
    </div>
    <p>
      <strong>{message}</strong>
    </p>
  </div>
);

FlashMessage.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default FlashMessage;
