function createHelperButton() {
    const btn = document.createElement('div');
    btn.style.position = 'fixed';
    btn.style.bottom = '100px';
    btn.style.right = '30px';
    btn.style.background = '#24292f';
    btn.style.color = 'white';
    btn.style.padding = '10px';
    btn.style.borderRadius = '8px';
    btn.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    btn.style.zIndex = 9999;
    btn.style.cursor = 'pointer';
    btn.innerText = '🛠 Add Template';
  
    btn.onclick = () => showTemplateOptions();
  
    document.body.appendChild(btn);
  }
  
  function showTemplateOptions() {
    const textarea = document.querySelector('textarea#issue_body');
    if (!textarea) return;
  
    const choice = prompt("Choose template:\n1. Bug Report\n2. Feature Request");
  
    if (choice === "1") {
      textarea.value = `## 🐞 Bug Report
  
  **Description:**
  _A clear and concise description of what the bug is._
  
  **Steps to Reproduce:**
  1. Go to '...'
  2. Click on '...'
  3. See error
  
  **Expected behavior:**
  _A clear and concise description of what you expected to happen._
  
  **Environment:**
  - OS:
  - Browser:
  
  `;
    } else if (choice === "2") {
      textarea.value = `## 🚀 Feature Request
  
  **Problem:**
  _What problem are you trying to solve?_
  
  **Proposed Solution:**
  _Describe the solution you'd like._
  
  **Alternatives Considered:**
  _Any alternative solutions you've considered._
  
  **Additional Context:**
  _Add any other context or screenshots here._
  
  `;
    }
  }
  
  window.addEventListener('load', () => {
    setTimeout(() => {
      const textarea = document.querySelector('textarea#issue_body');
      if (textarea) {
        createHelperButton();
      }
    }, 1000);
  });
  