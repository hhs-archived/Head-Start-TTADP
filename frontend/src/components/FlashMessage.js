import React from 'react';
import PropTypes from 'prop-types';
import './FlashMessage.css';
import LLAMA_IMAGE from '../images/llama_sm.png';
import LLAMA_HEAD_IMAGE from '../images/llama_head.png';

//       <img src={LLAMA_IMAGE} width="120" height="137" alt="llama_message Logo" />
//       <img src={LLAMA_HEAD_IMAGE} width="120" height="137" alt="llama_message Logo" />
  //<img className="center-llama-head" src={LLAMA_HEAD_IMAGE} width="71" height="128" alt="llama_message Logo" />;
const FlashMessage = ({ message, type }) => (
  <div className={`flash-message flash-message-type-${type}`}>
    <div className="flash-message-tab">
      <img className="center-llama-head" src={LLAMA_HEAD_IMAGE} width="120" height="137" alt="llama_message Logo" />
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
