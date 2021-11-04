import React from 'react';
import PropTypes from 'prop-types';
import './FlashMessage.css';
import LLAMA_IMAGE from '../images/llama_sm.png';
import LLAMA_HEAD_IMAGE from '../images/llama_head.png';
import { FLASH_MESSAGE_TYPES, FLASH_MESSAGE_IMAGE_TYPES } from '../Constants';

//       <img src={LLAMA_IMAGE} width="120" height="137" alt="llama_message Logo" />
//       <img src={LLAMA_HEAD_IMAGE} width="120" height="137" alt="llama_message Logo" />
// <img className="center-llama-head" src={LLAMA_HEAD_IMAGE} width="71" height="128" alt="llama_message Logo" />;

const determineImage = (type) => {
  if (type === FLASH_MESSAGE_TYPES.SUCCESS) {
    //return (<img src={LLAMA_IMAGE} width="120" height="137" alt="llama_message Logo" />);
    return (<img className="center-llama-head" src={LLAMA_HEAD_IMAGE} width="64" height="115" alt="llama_message Logo" />);

  }

  if (type === FLASH_MESSAGE_TYPES.CELEBRATE) {
    //return (<img src={LLAMA_IMAGE} width="120" height="137" alt="llama_message Logo" />);
    return (<img className="center-llama-head" src={LLAMA_HEAD_IMAGE} width="64" height="115" alt="llama_message Logo" />);

  }

  if (type === FLASH_MESSAGE_TYPES.ERROR) {
    return (<img className="center-llama-head" src={LLAMA_HEAD_IMAGE} width="64" height="115" alt="llama_message Logo" />);
  }

  return null;
};
// <img className="center-llama-head" src={LLAMA_HEAD_IMAGE} width="120" height="137" alt="llama_message Logo" />
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
