import './style.css';

const textArea = document.getElementById('texts')! as HTMLTextAreaElement;
const generateButton = document.getElementById('generate')! as HTMLButtonElement;
const tempreature = document.getElementById('temperature')! as HTMLInputElement;
const maxTokens = document.getElementById('max-tokens')! as HTMLInputElement;
const presence_penalty = document.getElementById('presence-penalty')! as HTMLInputElement;

const appState = {
  generating: false
}

generateButton.addEventListener('click', async () => {
  if(!appState.generating){
    appState.generating = true;
    textArea.disabled = true;
    generateButton.textContent = '⏸ Stop';
  }else{
    appState.generating = false;
    textArea.disabled = false;
    generateButton.textContent = '▶ Generate';
    return;
  }

  const texts = textArea.value;
  const res = await fetch('https://deepseeon-proxy-cppwvvnmju.cn-hangzhou.fcapp.run/completions', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "model": "deepseek-chat",
      "prompt": texts,
      "echo": false,
      "frequency_penalty": 0,
      "logprobs": 0,
      "max_tokens": parseFloat(maxTokens.value),
      "presence_penalty": parseFloat(presence_penalty.value),
      "stop": null,
      "stream": true,
      "stream_options": null,
      "suffix": null,
      "temperature": parseFloat(tempreature.value),
      "top_p": 1
    })
  });
  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  receive: while (true) {
    const { done, value } = await reader!.read();
    if (done || !appState.generating) {
      break;
    }
    const texts = decoder.decode(value).trim().split('data: ');
    for(let t of texts){
      if(t.length <= 1){
        continue;
      }
      if(t === '[DONE]'){
        break receive;
      }
      console.log(t)
      const data = JSON.parse(t);
      textArea.value += data.choices[0].text;
    }
  }
  appState.generating = false;
  textArea.disabled = false;
  generateButton.textContent = '▶ Generate';
});

function showRangeValue(inputEl: HTMLInputElement, labelEl: HTMLLabelElement) {
  const labelText = labelEl.textContent;
  labelEl.textContent = `${labelText}: ${inputEl.value}`;
  inputEl.addEventListener('input', () => {
    labelEl.textContent = `${labelText}: ${inputEl.value}`;
  });
}

showRangeValue(tempreature, document.getElementById('temperature-label')! as HTMLLabelElement);
showRangeValue(maxTokens, document.getElementById('max-tokens-label')! as HTMLLabelElement);
showRangeValue(presence_penalty, document.getElementById('presence-penalty-label')! as HTMLLabelElement);