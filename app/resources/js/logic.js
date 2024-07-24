let nodeStack = [];

const details = document.getElementById('details');
const yesButton = document.getElementById('yes');
const noButton = document.getElementById('no');
const backButton = document.getElementById('back');
const resetButton = document.getElementById('reset');
const licenses = document.getElementById('licenses');
const downloadTreeText = document.getElementById('download-tree');
const downloadMermaid = document.getElementById('download-mermaid');
const BASE_URL = 'https://api.github.com/licenses/';
const LICENSE_URL = 'https://docs.github.com/en/rest/licenses/licenses';
const UNDEFINED_LICENSES = ['Consider using', 'You should'];
const alert = document.querySelector('sl-alert');

async function fetchDescription() {
  try {
    const resp = await fetch (BASE_URL + tree.answer);
    const data = await resp.json();
    return (data.description);
  } catch (error) {
    console.error(error);
  }
}

async function setLicenseDesc() {
  if (isLicenseAnswer()) {
    return;
  }
  try {
    console.log('licenseDesc', tree.answer);
    const desc = await fetchDescription();
    details.innerHTML = `${desc}<br/><a href="${LICENSE_URL}" target="_blank">Description fetched from GitHub API</a>`;
  } catch (error) {
    console.error(error);
  }
}

function main(choice) {
  console.log('main');
  if (!tree.isQuestion) {
    return;
  }
  move(choice);
  nodeStack.push(tree);
  console.log('\tnodeStack', nodeStack);
  updateInfo();
  persist();
}

function updateInfo() {
  details.innerHTML = '';
  if (!tree.isQuestion) {
    details.summary = answerStr();
    setLicenseDesc();
    console.log('\tanswer');
  } else {
    details.summary = tree.question;
    details.innerText = tree.elaboration;
    console.log('\tquestion');
  }
  buttonAvailability();
}

function decisionTreeToMermaid() {
  const mermaid = 'graph TD\n';
  const nodes = [];

  function response(node) {
    if (node.isQuestion) {
      return node.question;
    }
    return node.answer;
  }

  function makeId() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let counter = 0;
    let res = '';
    while (counter < 6) {
      res += characters.charAt(Math.floor(Math.random() * characters.length));
      counter++;
    }
    return res;
  }

  function traverse(node, curId) {
    if (!node) {
      return;
    }
    if (!node.isQuestion) { return; }
    const yesId = makeId();
    const noId = makeId();
    nodes.push(`${curId}("${node.question}") -- yes --> ${yesId}("${response(node.yes)}")`);
    nodes.push(`${curId}("${node.question}") -- no --> ${noId}("${response(node.no)}")`);
    traverse(node.yes, yesId);
    traverse(node.no, noId);
  }
  traverse(decisionTree.head, makeId());

  const resStr = mermaid + nodes.join('\n');

  navigator.clipboard.writeText(resStr).then(function() {
    alert.variant = 'success';
    alert.innerHTML = '<sl-icon slot="icon" name="check2-circle"></sl-icon>' + 'The mermaid diagram has successfully been downloaded to your clipboard';
    alert.show();
  }, function(err) {
    alert.variant = 'danger';
    alert.innerHTML = '<sl-icon slot="icon" name="exclamation-octagon"></sl-icon>' + 'Could not copy text: ' + err;
    console.error('Could not copy text: ', err);
  });
}

function isLicenseAnswer() {
  return UNDEFINED_LICENSES.some(str => (tree.answer).includes(str));
}

function answerStr() {
  if (isLicenseAnswer()) {
    return tree.answer;
  }
  return 'Choose the ' + tree.answer + ' license.';
}

function buttonAvailability() {
  if (!tree.isQuestion) {
    yesButton.disabled = true;
    noButton.disabled = true;
  } else {
    if (yesButton.hasAttribute('disabled') && noButton.hasAttribute('disabled')) {
      yesButton.removeAttribute('disabled');
      noButton.removeAttribute('disabled');
    }
  }
  if (tree == decisionTree.head || nodeStack.length === 1) {
    backButton.disabled = true;
    resetButton.disabled = true;
  } else {
    if (backButton.hasAttribute('disabled') && resetButton.hasAttribute('disabled')) {
      backButton.removeAttribute('disabled');
      resetButton.removeAttribute('disabled');
    }
  }
}

function move(choice) {
  console.log('move');
  if (choice === 'yes') {
    tree = tree.yes;
  } else if (choice === 'no') {
    tree = tree.no;
  }
  console.log('\ttree', tree);
}

function persist() {
  console.log('persist');
  sessionStorage.setItem('nodeStack', JSON.stringify(nodeStack));
  console.log('\tpersistedNodeStack', JSON.parse(sessionStorage.getItem('nodeStack')));
}

function restore() {
  console.log('restore');
  persistedNodeStack = JSON.parse(sessionStorage.getItem('nodeStack'));
  if (persistedNodeStack === null || persistedNodeStack.length === 0) {
    console.log('\tno persistedNodeStack');
    tree = decisionTree.head;
    nodeStack.push(tree);
    console.log('\tnodeStack', nodeStack);
    updateInfo();
    return;
  }
  nodeStack = persistedNodeStack;
  console.log('\tnodeStack', nodeStack);
  tree = nodeStack[nodeStack.length - 1];
  console.log('\ttree', tree);
  updateInfo();
}

function reset() {
  console.log('reset');
  if (tree == decisionTree.head) {
    console.log('\troot');
    return;
  }
  tree = decisionTree.head;
  nodeStack = [tree];
  persist();
  updateInfo();
}

function back() {
  console.log('back');
  if (tree == decisionTree.head || nodeStack.length === 1) {
    console.log('\troot');
    return;
  }
  nodeStack.pop();
  tree = nodeStack[nodeStack.length - 1];
  persist();
  updateInfo();
}

function setLicensesUsed() {
  console.log('returnAllLicenses');
  const ul = document.createElement('ul');
  const licensesList = flatten(decisionTree.head);
  licensesList.forEach(item => {
    if (!item) {
      return;
    }
    const li = document.createElement('li');
    li.textContent = item;
    ul.appendChild(li);
  })
  licenses.innerHTML = ul.outerHTML;
}

function flatten(node) {
  if (node.isQuestion) {
    return flatten(node.yes).concat(flatten(node.no));
  }
  const res = node.answer;
  if (res.includes('Consider') || res.includes('You should')) {
    return;
  }
  return [res];
}

function downloadTree() {
  const decisionTreeStr = JSON.stringify(decisionTree, null, 2);
  const blob = new Blob([decisionTreeStr], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'decisionTree.txt';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', function() {
  if (licenses) {
    setLicensesUsed();

    downloadTreeText.addEventListener('mousedown', function() {
      downloadTree();
    });

    downloadMermaid.addEventListener('mousedown', function() {
      decisionTreeToMermaid();
    });
  }

  if (!details) {
    return;
  }

  restore();

  yesButton.addEventListener('mousedown', function() {
    main('yes');
  });
  noButton.addEventListener('mousedown', function() {
    main('no');
  });

  backButton.addEventListener('mousedown', function() {
    back();
  });
  resetButton.addEventListener('mousedown', function() {
    reset();
  });
});

const decisionTree = {
  head: {
    isQuestion: true,
    question: 'Do you want to open-source your project?',
    elaboration: `Do you want to make your source code publicly 
      available and allow others to use, modify, and distribute it.`,
    yes: { // Do you want to open-source your project? -> Yes
      isQuestion: true,
      question: 'Do you want a permissive license?',
      elaboration: `Do you want a more lenient license and allow others to use, modify, 
        and distribute your code with minimal restrictions. 
        These licenses are generally business-friendly and encourage wider use.`,
      yes: { // Do you want a permissive license? -> Yes
        isQuestion: true,
        question: 'Do you require minimal conditions?',
        elaboration: `Do you want minimal conditions meaning that there are very 
          few requirements placed on the use of your code. 
          This typically includes providing attribution to the original authors.`,
        yes: { // Do you require minimal conditions? -> Yes
          isQuestion: true,
          question: 'Do you want the simplest and most permissive license possible?',
          elaboration: `Do you want a license that is very permissive and has minimal requirements, 
            making it as simple as possible for others to use your code.`,
          yes: { // Do you want the simplest and most permissive license possible? -> Yes
            isQuestion: false,
            answer: 'MIT',
          },
          no: { // Do you want the simplest and most permissive license possible? -> No
            isQuestion: false,
            answer: 'BSD-2-Clause',
          },
        },
        no: { // Do you require minimal conditions? -> No
          isQuestion: true,
          question: 'Do you want explicit patent grants?',
          elaboration: `Do you want to include explicit grants of patent rights, 
            which can protect users from patent litigation. 
            This is an important consideration for projects that may involve patented technology.`,
          yes: { // Do you want explicit patent grants? -> Yes
            isQuestion: false,
            answer: 'Apache-2.0',
          },
          no: { // Do you want explicit patent grants? -> No
            isQuestion: true,
            question: 'Do you want a permissive license with some conditions?',
            elaboration: `Do you want a permissive license that includes some conditions such as providing attribution 
              and not using the name of the project or its contributors for promotion without permission.`,
            yes: { // Do you want a permissive license with some conditions? -> Yes
              isQuestion: false,
              answer: 'BSD-3-Clause',
            },
            no: { // Do you want a permissive license with some conditions? -> No
              isQuestion: true,
              question: 'Do you want the simplest permissive license with no conditions?',
              elaboration: `Do you want the simplest permissive license with no conditions, 
                providing complete freedom to use the code without any restrictions.`,
              yes: { // Do you want the simplest permissive license with no conditions? -> Yes
                isQuestion: false,
                answer: '0BSD',
              },
              no: { // Do you want the simplest permissive license with no conditions? -> No
                isQuestion: false,
                answer: 'ISC',
              },
            },
          },
        },
      },
      no: { // Do you want a permissive license? -> No
        isQuestion: true,
        question: 'Do you want a copyleft license?',
        elaboration: `Do you want to require that any modified versions of your code 
          be distributed under the same license, ensuring that the code 
          (and its derivatives) remain open source.`,
        yes: { // Do you want a copyleft license? -> Yes
          isQuestion: true,
          question: 'Do you want strong copyleft?',
          elaboration: `Do you want to require that any distributed modifications 
            (or in some cases, software that interacts with the copylefted code) also be open-sourced. 
            This ensures that improvements to the code are shared with the community.`,
          yes: { // Do you want strong copyleft? -> Yes
            isQuestion: true,
            question: 'Do you want network server protection?',
            elaboration: `Do you want to extend copyleft requirements to software provided over a network. 
              This means that users who interact with the software over a network (e.g., web applications) 
              must also have access to the source code.`,
            yes: { // Do you want network server protection? -> Yes 
              isQuestion: false,
              answer: 'AGPL-3.0',
            },
            no: { // Do you want network server protection? -> No
              isQuestion: true,
              question: 'Do you want to use the latest version of the GPL license?',
              elaboration: `Do you prefer using the latest version of the GPL license, which includes additional protections 
                and clarifications compared to older versions.`,
              yes: { // Do you want to use the latest version of the GPL license? -> Yes
                isQuestion: false,
                answer: 'GPL-3.0',
              },
              no: { // Do you want to use the latest version of the GPL license? -> No
                isQuestion: false,
                answer: 'GPL-2.0',
              },
            },
          },
          no: { // Do you want strong copyleft? -> No
            isQuestion: true,
            question: 'Do you want to allow linking with non-(L)GPL software?',
            elaboration: `Do you want to allow linking with non-(L)GPL software, making it easier to use your code 
              as a library in proprietary software while keeping modifications to the library itself open source.`,
            yes: { // Do you want to allow linking with non-(L)GPL software? -> Yes
              isQuestion: false,
              answer: 'LGPL-3.0',
            },
            no: { // Do you want to allow linking with non-(L)GPL software? -> No
              isQuestion: true,
              question: 'Do you want a copyleft license with weaker requirements?',
              elaboration: `Do you want a copyleft license that has weaker requirements compared to the GPL, 
                such as allowing proprietary modules in your project.`,
              yes: { // Do you want a copyleft license with weaker requirements? -> Yes
                isQuestion: false,
                answer: 'MPL-2.0',
              },
              no: { // Do you want a copyleft license with weaker requirements? -> No
                isQuestion: true,
                question: 'Do you prefer a copyleft license with a focus on business-friendly terms?',
                elaboration: `Do you prefer a copyleft license that has a focus on business-friendly terms, 
                  making it easier for companies to adopt.`,
                yes: { // Do you prefer a copyleft license with a focus on business-friendly terms? -> Yes
                  isQuestion: false,
                  answer: 'EPL-2.0',
                },
                no: { // Do you prefer a copyleft license with a focus on business-friendly terms? -> No
                  isQuestion: false,
                  answer: 'EPL-1.0',
                },
              },
            },
          },
        },
        no: { // Do you want a copyleft license? -> No
          isQuestion: true,
          question: 'Do you want to dedicate your work to the public domain?',
          elaboration: `Do you want to dedicate your work to the public domain, allowing anyone to use, modify, and distribute 
            your work without any restrictions.`,
          yes: { // Do you want to dedicate your work to the public domain? -> Yes
            isQuestion: false,
            answer: 'Unlicense',
          },
          no: { // Do you want to dedicate your work to the public domain? -> No
            isQuestion: true,
            question: 'Do you want a license for fonts?',
            elaboration: `Do you want a license specifically designed for fonts, 
              allowing embedding, modifying, and redistributing the font.`,
            yes: { // Do you want a license for fonts? -> Yes
              isQuestion: false,
              answer: 'OFL-1.1',
            },
            no: { // Do you want a license for fonts? -> No
              isQuestion: false,
              answer: 'Consider using a proprietary license or another specialized license.',
            },
          },
        },
      }
    },
    no: { // Do you want to open-source your project? -> No
      isQuestion: false,
      answer: 'You should consider keeping your project closed-source.',
    },
  },
}

let tree;
