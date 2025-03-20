console.log("MosaicSlicer: content script loaded");

//https://stackoverflow.com/a/66046176
async function bufferToBase64(buffer) {
  // use a FileReader to generate a base64 data URI:
  const base64url = await new Promise(r => {
    const reader = new FileReader();
    reader.onload = () => r(reader.result);
    reader.readAsDataURL(new Blob([buffer]));
  });
  // remove the `data:...;base64,` part from the start
  return base64url.slice(base64url.indexOf(",") + 1);
}

setInterval(() => {
  if (!location.pathname.startsWith("/model"))
    return;

  let download_wrappers = document.querySelectorAll(".download-wrapper");
  for (let i = 0; i < download_wrappers.length; i++) {
    let download_wrapper = download_wrappers[i];
    if (download_wrapper.dataset.injected)
      continue;
    download_wrapper.dataset.injected = true;

    let download_btn = download_wrapper.children[download_wrapper.children.length - 1];
    let download_itm = download_wrapper.parentElement.parentElement.parentElement;
    let file_name = download_itm.children[0].innerText;
    let file_ext = file_name.split(".").at(-1).toLowerCase();

    if (!["3mf", "stl"].includes(file_ext))
      continue;

    let icon_img = document.createElement("img");
    icon_img.style.width = "14px";
    icon_img.style.height = "14px";
    icon_img.src = chrome.runtime.getURL("img/logo.svg");

    let new_btn = download_btn.cloneNode(true);
    new_btn.replaceChildren();
    new_btn.append(icon_img);
    new_btn.append(new Text("MosaicSlicer"));
    new_btn.onclick = async () => {
      new_btn.disabled = true;
      await download_file(file_name);
      new_btn.disabled = false;
    };

    download_wrapper.insertBefore(new_btn, download_btn);
  }
}, 100);

async function download_file(file_name) {
  let model_id = [...location.pathname.matchAll(/\/model\/(\d+)/g)][0][1];
  let model_files_res = await fetch("https://api.printables.com/graphql/", {
    "headers": {
      "accept":
        "application/graphql-response+json, application/graphql+json, application/json, text/event-stream, multipart/mixed",
      "content-type": "application/json"
    },
    "body": JSON.stringify({
      "operationName": "ModelFiles",
      "query":
        "query ModelFiles($id: ID!) {\n  model: print(id: $id) {\n    id\n    filesType\n    gcodes {\n      ...GcodeDetail\n      __typename\n    }\n    stls {\n      ...StlDetail\n      __typename\n    }\n    slas {\n      ...SlaDetail\n      __typename\n    }\n    otherFiles {\n      ...OtherFileDetail\n      __typename\n    }\n    downloadPacks {\n      id\n      name\n      fileSize\n      fileType\n      __typename\n    }\n    __typename\n  }\n}\nfragment GcodeDetail on GCodeType {\n  id\n  created\n  name\n  folder\n  note\n  printer {\n    id\n    name\n    __typename\n  }\n  excludeFromTotalSum\n  printDuration\n  layerHeight\n  nozzleDiameter\n  material {\n    id\n    name\n    __typename\n  }\n  weight\n  fileSize\n  filePreviewPath\n  rawDataPrinter\n  order\n  __typename\n}\nfragment OtherFileDetail on OtherFileType {\n  id\n  created\n  name\n  folder\n  note\n  fileSize\n  filePreviewPath\n  order\n  __typename\n}\nfragment SlaDetail on SLAType {\n  id\n  created\n  name\n  folder\n  note\n  expTime\n  firstExpTime\n  printer {\n    id\n    name\n    __typename\n  }\n  printDuration\n  layerHeight\n  usedMaterial\n  fileSize\n  filePreviewPath\n  order\n  __typename\n}\nfragment StlDetail on STLType {\n  id\n  created\n  name\n  folder\n  note\n  fileSize\n  filePreviewPath\n  order\n  __typename\n}",
      "variables": {
        "id": model_id
      }
    }),
    "method": "POST"
  });

  let model_files = (await model_files_res.json()).data.model.stls;
  let file_id;
  for (let model_file of model_files) {
    if (model_file.name === file_name)
      file_id = model_file.id;
  }

  let download_link_res = await fetch("https://api.printables.com/graphql/", {
    "headers": {
      "accept":
        "application/graphql-response+json, application/graphql+json, application/json, text/event-stream, multipart/mixed",
      "content-type": "application/json"
    },
    "body": JSON.stringify({
      "operationName": "GetDownloadLink",
      "query":
        "mutation GetDownloadLink($id: ID!, $modelId: ID!, $fileType: DownloadFileTypeEnum!, $source: DownloadSourceEnum!) {\n  getDownloadLink(\n    id: $id\n    printId: $modelId\n    fileType: $fileType\n    source: $source\n  ) {\n    ok\n    errors {\n      ...Error\n      __typename\n    }\n    output {\n      link\n      count\n      ttl\n      __typename\n    }\n    __typename\n  }\n}\nfragment Error on ErrorType {\n  field\n  messages\n  __typename\n}",
      "variables": {
        "fileType": "stl",
        "id": file_id,
        "modelId": model_id,
        "source": "model_detail"
      }
    }),
    "method": "POST"
  });
  let download_link = (await download_link_res.json()).data.getDownloadLink.output.link;

  let stl_res = await fetch(download_link);
  let stl_data = await stl_res.arrayBuffer();
  chrome.runtime.sendMessage({cmd: "load_model", args: [file_name, await bufferToBase64(stl_data)]});
}
