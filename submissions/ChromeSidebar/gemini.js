/**
 * Bundled by jsDelivr using Rollup v2.79.1 and Terser v5.19.2.
 * Original file: /npm/@google/generative-ai@0.14.1/dist/index.mjs
 *
 * Do NOT use SRI with dynamically generated files! More information: https://www.jsdelivr.com/using-sri-with-dynamic-files
 */
var t,e,n;!function(t){t.STRING="STRING",t.NUMBER="NUMBER",t.INTEGER="INTEGER",t.BOOLEAN="BOOLEAN",t.ARRAY="ARRAY",t.OBJECT="OBJECT"}(t||(t={})),function(t){t.LANGUAGE_UNSPECIFIED="language_unspecified",t.PYTHON="python"}(e||(e={})),function(t){t.OUTCOME_UNSPECIFIED="outcome_unspecified",t.OUTCOME_OK="outcome_ok",t.OUTCOME_FAILED="outcome_failed",t.OUTCOME_DEADLINE_EXCEEDED="outcome_deadline_exceeded"}(n||(n={}));
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const s=["user","model","function","system"];var o,i,a,r,c,d,l;!function(t){t.HARM_CATEGORY_UNSPECIFIED="HARM_CATEGORY_UNSPECIFIED",t.HARM_CATEGORY_HATE_SPEECH="HARM_CATEGORY_HATE_SPEECH",t.HARM_CATEGORY_SEXUALLY_EXPLICIT="HARM_CATEGORY_SEXUALLY_EXPLICIT",t.HARM_CATEGORY_HARASSMENT="HARM_CATEGORY_HARASSMENT",t.HARM_CATEGORY_DANGEROUS_CONTENT="HARM_CATEGORY_DANGEROUS_CONTENT"}(o||(o={})),function(t){t.HARM_BLOCK_THRESHOLD_UNSPECIFIED="HARM_BLOCK_THRESHOLD_UNSPECIFIED",t.BLOCK_LOW_AND_ABOVE="BLOCK_LOW_AND_ABOVE",t.BLOCK_MEDIUM_AND_ABOVE="BLOCK_MEDIUM_AND_ABOVE",t.BLOCK_ONLY_HIGH="BLOCK_ONLY_HIGH",t.BLOCK_NONE="BLOCK_NONE"}(i||(i={})),function(t){t.HARM_PROBABILITY_UNSPECIFIED="HARM_PROBABILITY_UNSPECIFIED",t.NEGLIGIBLE="NEGLIGIBLE",t.LOW="LOW",t.MEDIUM="MEDIUM",t.HIGH="HIGH"}(a||(a={})),function(t){t.BLOCKED_REASON_UNSPECIFIED="BLOCKED_REASON_UNSPECIFIED",t.SAFETY="SAFETY",t.OTHER="OTHER"}(r||(r={})),function(t){t.FINISH_REASON_UNSPECIFIED="FINISH_REASON_UNSPECIFIED",t.STOP="STOP",t.MAX_TOKENS="MAX_TOKENS",t.SAFETY="SAFETY",t.RECITATION="RECITATION",t.OTHER="OTHER"}(c||(c={})),function(t){t.TASK_TYPE_UNSPECIFIED="TASK_TYPE_UNSPECIFIED",t.RETRIEVAL_QUERY="RETRIEVAL_QUERY",t.RETRIEVAL_DOCUMENT="RETRIEVAL_DOCUMENT",t.SEMANTIC_SIMILARITY="SEMANTIC_SIMILARITY",t.CLASSIFICATION="CLASSIFICATION",t.CLUSTERING="CLUSTERING"}(d||(d={})),function(t){t.MODE_UNSPECIFIED="MODE_UNSPECIFIED",t.AUTO="AUTO",t.ANY="ANY",t.NONE="NONE"}(l||(l={}));
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class u extends Error{constructor(t){super(`[GoogleGenerativeAI Error]: ${t}`)}}class h extends u{constructor(t,e){super(t),this.response=e}}class f extends u{constructor(t,e,n,s){super(t),this.status=e,this.statusText=n,this.errorDetails=s}}class E extends u{}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */const p="0.14.1",g="genai-js";var C;!function(t){t.GENERATE_CONTENT="generateContent",t.STREAM_GENERATE_CONTENT="streamGenerateContent",t.COUNT_TOKENS="countTokens",t.EMBED_CONTENT="embedContent",t.BATCH_EMBED_CONTENTS="batchEmbedContents"}(C||(C={}));class m{constructor(t,e,n,s,o){this.model=t,this.task=e,this.apiKey=n,this.stream=s,this.requestOptions=o}toString(){var t,e;const n=(null===(t=this.requestOptions)||void 0===t?void 0:t.apiVersion)||"v1beta";let s=`${(null===(e=this.requestOptions)||void 0===e?void 0:e.baseUrl)||"https://generativelanguage.googleapis.com"}/${n}/${this.model}:${this.task}`;return this.stream&&(s+="?alt=sse"),s}}async function O(t){var e;const n=new Headers;n.append("Content-Type","application/json"),n.append("x-goog-api-client",function(t){const e=[];return(null==t?void 0:t.apiClient)&&e.push(t.apiClient),e.push(`${g}/${p}`),e.join(" ")}(t.requestOptions)),n.append("x-goog-api-key",t.apiKey);let s=null===(e=t.requestOptions)||void 0===e?void 0:e.customHeaders;if(s){if(!(s instanceof Headers))try{s=new Headers(s)}catch(t){throw new E(`unable to convert customHeaders value ${JSON.stringify(s)} to Headers: ${t.message}`)}for(const[t,e]of s.entries()){if("x-goog-api-key"===t)throw new E(`Cannot set reserved header name ${t}`);if("x-goog-api-client"===t)throw new E(`Header name ${t} can only be set using the apiClient field`);n.append(t,e)}}return n}async function y(t,e,n,s,o,i,a=fetch){const{url:r,fetchOptions:c}=await async function(t,e,n,s,o,i){const a=new m(t,e,n,s,i);return{url:a.toString(),fetchOptions:Object.assign(Object.assign({},_(i)),{method:"POST",headers:await O(a),body:o})}}(t,e,n,s,o,i);return async function(t,e,n=fetch){let s;try{s=await n(t,e)}catch(e){!function(t,e){let n=t;t instanceof f||t instanceof E||(n=new u(`Error fetching from ${e.toString()}: ${t.message}`),n.stack=t.stack);throw n}(e,t)}s.ok||await async function(t,e){let n,s="";try{const e=await t.json();s=e.error.message,e.error.details&&(s+=` ${JSON.stringify(e.error.details)}`,n=e.error.details)}catch(t){}throw new f(`Error fetching from ${e.toString()}: [${t.status} ${t.statusText}] ${s}`,t.status,t.statusText,n)}(s,t);return s}(r,c,a)}function _(t){const e={};if((null==t?void 0:t.timeout)>=0){const n=new AbortController,s=n.signal;setTimeout((()=>n.abort()),t.timeout),e.signal=s}return e}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function T(t){return t.text=()=>{if(t.candidates&&t.candidates.length>0){if(t.candidates.length>1&&console.warn(`This response had ${t.candidates.length} candidates. Returning text from the first candidate only. Access response.candidates directly to use the other candidates.`),R(t.candidates[0]))throw new h(`${N(t)}`,t);return function(t){var e,n,s,o;const i=[];if(null===(n=null===(e=t.candidates)||void 0===e?void 0:e[0].content)||void 0===n?void 0:n.parts)for(const e of null===(o=null===(s=t.candidates)||void 0===s?void 0:s[0].content)||void 0===o?void 0:o.parts)e.text&&i.push(e.text),e.executableCode&&i.push("\n```python\n"+e.executableCode.code+"\n```\n"),e.codeExecutionResult&&i.push("\n```\n"+e.codeExecutionResult.output+"\n```\n");return i.length>0?i.join(""):""}(t)}if(t.promptFeedback)throw new h(`Text not available. ${N(t)}`,t);return""},t.functionCall=()=>{if(t.candidates&&t.candidates.length>0){if(t.candidates.length>1&&console.warn(`This response had ${t.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),R(t.candidates[0]))throw new h(`${N(t)}`,t);return console.warn("response.functionCall() is deprecated. Use response.functionCalls() instead."),v(t)[0]}if(t.promptFeedback)throw new h(`Function call not available. ${N(t)}`,t)},t.functionCalls=()=>{if(t.candidates&&t.candidates.length>0){if(t.candidates.length>1&&console.warn(`This response had ${t.candidates.length} candidates. Returning function calls from the first candidate only. Access response.candidates directly to use the other candidates.`),R(t.candidates[0]))throw new h(`${N(t)}`,t);return v(t)}if(t.promptFeedback)throw new h(`Function call not available. ${N(t)}`,t)},t}function v(t){var e,n,s,o;const i=[];if(null===(n=null===(e=t.candidates)||void 0===e?void 0:e[0].content)||void 0===n?void 0:n.parts)for(const e of null===(o=null===(s=t.candidates)||void 0===s?void 0:s[0].content)||void 0===o?void 0:o.parts)e.functionCall&&i.push(e.functionCall);return i.length>0?i:void 0}const I=[c.RECITATION,c.SAFETY];function R(t){return!!t.finishReason&&I.includes(t.finishReason)}function N(t){var e,n,s;let o="";if(t.candidates&&0!==t.candidates.length||!t.promptFeedback){if(null===(s=t.candidates)||void 0===s?void 0:s[0]){const e=t.candidates[0];R(e)&&(o+=`Candidate was blocked due to ${e.finishReason}`,e.finishMessage&&(o+=`: ${e.finishMessage}`))}}else o+="Response was blocked",(null===(e=t.promptFeedback)||void 0===e?void 0:e.blockReason)&&(o+=` due to ${t.promptFeedback.blockReason}`),(null===(n=t.promptFeedback)||void 0===n?void 0:n.blockReasonMessage)&&(o+=`: ${t.promptFeedback.blockReasonMessage}`);return o}function A(t){return this instanceof A?(this.v=t,this):new A(t)}function S(t,e,n){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var s,o=n.apply(t,e||[]),i=[];return s={},a("next"),a("throw"),a("return"),s[Symbol.asyncIterator]=function(){return this},s;function a(t){o[t]&&(s[t]=function(e){return new Promise((function(n,s){i.push([t,e,n,s])>1||r(t,e)}))})}function r(t,e){try{(n=o[t](e)).value instanceof A?Promise.resolve(n.value.v).then(c,d):l(i[0][2],n)}catch(t){l(i[0][3],t)}var n}function c(t){r("next",t)}function d(t){r("throw",t)}function l(t,e){t(e),i.shift(),i.length&&r(i[0][0],i[0][1])}}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const w=/^data\: (.*)(?:\n\n|\r\r|\r\n\r\n)/;function b(t){const e=function(t){const e=t.getReader();return new ReadableStream({start(t){let n="";return s();function s(){return e.read().then((({value:e,done:o})=>{if(o)return n.trim()?void t.error(new u("Failed to parse stream")):void t.close();n+=e;let i,a=n.match(w);for(;a;){try{i=JSON.parse(a[1])}catch(e){return void t.error(new u(`Error parsing JSON response: "${a[1]}"`))}t.enqueue(i),n=n.substring(a[0].length),a=n.match(w)}return s()}))}}})}(t.body.pipeThrough(new TextDecoderStream("utf8",{fatal:!0}))),[n,s]=e.tee();return{stream:x(n),response:M(s)}}async function M(t){const e=[],n=t.getReader();for(;;){const{done:t,value:s}=await n.read();if(t)return T(D(e));e.push(s)}}function x(t){return S(this,arguments,(function*(){const e=t.getReader();for(;;){const{value:t,done:n}=yield A(e.read());if(n)break;yield yield A(T(t))}}))}function D(t){const e=t[t.length-1],n={promptFeedback:null==e?void 0:e.promptFeedback};for(const e of t){if(e.candidates)for(const t of e.candidates){const e=t.index;if(n.candidates||(n.candidates=[]),n.candidates[e]||(n.candidates[e]={index:t.index}),n.candidates[e].citationMetadata=t.citationMetadata,n.candidates[e].finishReason=t.finishReason,n.candidates[e].finishMessage=t.finishMessage,n.candidates[e].safetyRatings=t.safetyRatings,t.content&&t.content.parts){n.candidates[e].content||(n.candidates[e].content={role:t.content.role||"user",parts:[]});const s={};for(const o of t.content.parts)o.text&&(s.text=o.text),o.functionCall&&(s.functionCall=o.functionCall),o.executableCode&&(s.executableCode=o.executableCode),o.codeExecutionResult&&(s.codeExecutionResult=o.codeExecutionResult),0===Object.keys(s).length&&(s.text=""),n.candidates[e].content.parts.push(s)}}e.usageMetadata&&(n.usageMetadata=e.usageMetadata)}return n}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */async function H(t,e,n,s){return b(await y(e,C.STREAM_GENERATE_CONTENT,t,!0,JSON.stringify(n),s))}async function L(t,e,n,s){const o=await y(e,C.GENERATE_CONTENT,t,!1,JSON.stringify(n),s);return{response:T(await o.json())}}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */function U(t){if(null!=t)return"string"==typeof t?{role:"system",parts:[{text:t}]}:t.text?{role:"system",parts:[t]}:t.parts?t.role?t:{role:"system",parts:t.parts}:void 0}function F(t){let e=[];if("string"==typeof t)e=[{text:t}];else for(const n of t)"string"==typeof n?e.push({text:n}):e.push(n);return function(t){const e={role:"user",parts:[]},n={role:"function",parts:[]};let s=!1,o=!1;for(const i of t)"functionResponse"in i?(n.parts.push(i),o=!0):(e.parts.push(i),s=!0);if(s&&o)throw new u("Within a single message, FunctionResponse cannot be mixed with other type of part in the request for sending chat message.");if(!s&&!o)throw new u("No content is provided for sending chat message.");if(s)return e;return n}(e)}function P(t){let e;if(t.contents)e=t;else{e={contents:[F(t)]}}return t.systemInstruction&&(e.systemInstruction=U(t.systemInstruction)),e}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const $=["text","inlineData","functionCall","functionResponse","executableCode","codeExecutionResult"],G={user:["text","inlineData"],function:["functionResponse"],model:["text","functionCall","executableCode","codeExecutionResult"],system:["text"]};
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const B="SILENT_ERROR";class K{constructor(t,e,n,o){this.model=e,this.params=n,this.requestOptions=o,this._history=[],this._sendPromise=Promise.resolve(),this._apiKey=t,(null==n?void 0:n.history)&&(!function(t){let e=!1;for(const n of t){const{role:t,parts:o}=n;if(!e&&"user"!==t)throw new u(`First content should be with role 'user', got ${t}`);if(!s.includes(t))throw new u(`Each item should include role field. Got ${t} but valid roles are: ${JSON.stringify(s)}`);if(!Array.isArray(o))throw new u("Content should have 'parts' property with an array of Parts");if(0===o.length)throw new u("Each Content should have at least one part");const i={text:0,inlineData:0,functionCall:0,functionResponse:0,fileData:0,executableCode:0,codeExecutionResult:0};for(const t of o)for(const e of $)e in t&&(i[e]+=1);const a=G[t];for(const e of $)if(!a.includes(e)&&i[e]>0)throw new u(`Content with role '${t}' can't contain '${e}' part`);e=!0}}(n.history),this._history=n.history)}async getHistory(){return await this._sendPromise,this._history}async sendMessage(t){var e,n,s,o,i,a;await this._sendPromise;const r=F(t),c={safetySettings:null===(e=this.params)||void 0===e?void 0:e.safetySettings,generationConfig:null===(n=this.params)||void 0===n?void 0:n.generationConfig,tools:null===(s=this.params)||void 0===s?void 0:s.tools,toolConfig:null===(o=this.params)||void 0===o?void 0:o.toolConfig,systemInstruction:null===(i=this.params)||void 0===i?void 0:i.systemInstruction,cachedContent:null===(a=this.params)||void 0===a?void 0:a.cachedContent,contents:[...this._history,r]};let d;return this._sendPromise=this._sendPromise.then((()=>L(this._apiKey,this.model,c,this.requestOptions))).then((t=>{var e;if(t.response.candidates&&t.response.candidates.length>0){this._history.push(r);const n=Object.assign({parts:[],role:"model"},null===(e=t.response.candidates)||void 0===e?void 0:e[0].content);this._history.push(n)}else{const e=N(t.response);e&&console.warn(`sendMessage() was unsuccessful. ${e}. Inspect response object for details.`)}d=t})),await this._sendPromise,d}async sendMessageStream(t){var e,n,s,o,i,a;await this._sendPromise;const r=F(t),c={safetySettings:null===(e=this.params)||void 0===e?void 0:e.safetySettings,generationConfig:null===(n=this.params)||void 0===n?void 0:n.generationConfig,tools:null===(s=this.params)||void 0===s?void 0:s.tools,toolConfig:null===(o=this.params)||void 0===o?void 0:o.toolConfig,systemInstruction:null===(i=this.params)||void 0===i?void 0:i.systemInstruction,cachedContent:null===(a=this.params)||void 0===a?void 0:a.cachedContent,contents:[...this._history,r]},d=H(this._apiKey,this.model,c,this.requestOptions);return this._sendPromise=this._sendPromise.then((()=>d)).catch((t=>{throw new Error(B)})).then((t=>t.response)).then((t=>{if(t.candidates&&t.candidates.length>0){this._history.push(r);const e=Object.assign({},t.candidates[0].content);e.role||(e.role="model"),this._history.push(e)}else{const e=N(t);e&&console.warn(`sendMessageStream() was unsuccessful. ${e}. Inspect response object for details.`)}})).catch((t=>{t.message!==B&&console.error(t)})),d}}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
class Y{constructor(t,e,n){this.apiKey=t,e.model.includes("/")?this.model=e.model:this.model=`models/${e.model}`,this.generationConfig=e.generationConfig||{},this.safetySettings=e.safetySettings||[],this.tools=e.tools,this.toolConfig=e.toolConfig,this.systemInstruction=U(e.systemInstruction),this.cachedContent=e.cachedContent,this.requestOptions=n||{}}async generateContent(t){var e;const n=P(t);return L(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:null===(e=this.cachedContent)||void 0===e?void 0:e.name},n),this.requestOptions)}async generateContentStream(t){var e;const n=P(t);return H(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:null===(e=this.cachedContent)||void 0===e?void 0:e.name},n),this.requestOptions)}startChat(t){var e;return new K(this.apiKey,this.model,Object.assign({generationConfig:this.generationConfig,safetySettings:this.safetySettings,tools:this.tools,toolConfig:this.toolConfig,systemInstruction:this.systemInstruction,cachedContent:null===(e=this.cachedContent)||void 0===e?void 0:e.name},t),this.requestOptions)}async countTokens(t){const e=function(t,e){let n={};const s=null!=t.generateContentRequest;if(t.contents){if(s)throw new E("CountTokensRequest must have one of contents or generateContentRequest, not both.");n=Object.assign({},t)}else if(s)n=Object.assign({},t),n.generateContentRequest.model=e;else{const e=F(t);n.contents=[e]}return n}(t,this.model);return async function(t,e,n,s){return(await y(e,C.COUNT_TOKENS,t,!1,JSON.stringify(n),s)).json()}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */(this.apiKey,this.model,e,this.requestOptions)}async embedContent(t){const e=function(t){if("string"==typeof t||Array.isArray(t))return{content:F(t)};return t}(t);return async function(t,e,n,s){return(await y(e,C.EMBED_CONTENT,t,!1,JSON.stringify(n),s)).json()}(this.apiKey,this.model,e,this.requestOptions)}async batchEmbedContents(t){return async function(t,e,n,s){const o=n.requests.map((t=>Object.assign(Object.assign({},t),{model:e})));return(await y(e,C.BATCH_EMBED_CONTENTS,t,!1,JSON.stringify({requests:o}),s)).json()}(this.apiKey,this.model,t,this.requestOptions)}}
/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */class k{constructor(t){this.apiKey=t}getGenerativeModel(t,e){if(!t.model)throw new u("Must provide a model name. Example: genai.getGenerativeModel({ model: 'my-model-name' })");return new Y(this.apiKey,t,e)}getGenerativeModelFromCachedContent(t,e){if(!t.name)throw new E("Cached content must contain a `name` field.");if(!t.model)throw new E("Cached content must contain a `model` field.");const n={model:t.model,tools:t.tools,toolConfig:t.toolConfig,systemInstruction:t.systemInstruction,cachedContent:t};return new Y(this.apiKey,n,e)}}export{r as BlockReason,K as ChatSession,e as ExecutableCodeLanguage,c as FinishReason,l as FunctionCallingMode,t as FunctionDeclarationSchemaType,Y as GenerativeModel,k as GoogleGenerativeAI,u as GoogleGenerativeAIError,f as GoogleGenerativeAIFetchError,E as GoogleGenerativeAIRequestInputError,h as GoogleGenerativeAIResponseError,i as HarmBlockThreshold,o as HarmCategory,a as HarmProbability,n as Outcome,s as POSSIBLE_ROLES,d as TaskType};export default null;
//# sourceMappingURL=/sm/d5e0d0ade5f9f14d1105671b7b45773806d1cff406cbc1f8850aa186e740e123.map