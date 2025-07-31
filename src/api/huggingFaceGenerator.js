import axios from 'axios';
import {  HF_TOKEN, HF_API_URL } from '@env';

const generateHuggingBonkRoast = async (userInput) => {
  

  const headers = {
    Authorization: `Bearer ${HF_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const payload = {
    inputs: `Write a short funny bonk roast: ${userInput}`,
    parameters: {
      max_new_tokens: 60,      
      temperature: 0.9,        
    },
  };

  try {
    const response = await axios.post(HF_API_URL, payload, { headers });
    const output = response.data[0]?.generated_text;
    return output || 'Oops! No roast generated.';
  } catch (error) {
    console.error('Roast Generation Failed:', error?.response?.data || error.message);
    return 'Failed to generate roast.';
  }
};

export default generateHuggingBonkRoast;

