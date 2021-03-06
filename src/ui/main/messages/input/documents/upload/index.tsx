import * as React from "react";
import { observer, inject } from "mobx-react";
import Config from "src/config";
import { IDocumentUpload } from "src/models/document";
import { IRootStore } from "src/ui/store/interfeces";
require("./styles.scss");

const attauchIcon: string = require("assets/clip.svg");
const voiceCloseIcon: string = require("assets/cancel.svg");

interface IDocumentsUploadProps {
  store?: IRootStore;
}

@inject("store")
@observer
export default class DocumentsUpload extends React.Component<IDocumentsUploadProps> {
  private inputRef: React.RefObject<HTMLInputElement>;
  private formRef: React.RefObject<HTMLFormElement>;

  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.formRef = React.createRef();
    this.click = this.click.bind(this);
    this.getFiles = this.getFiles.bind(this);
    this.voiceRecordingClose = this.voiceRecordingClose.bind(this);
  }

  public click() {
    this.inputRef.current.click();
  }

  public voiceRecordingClose() {
    this.props.store.audioStore.cancelVoiceRecording();
  }

  public getFiles() {
    const inputFiles = this.inputRef.current.files;
    const sendFiles = [];
    const chatID = this.props.store.chatStore.currentChatID;
    for (const file of inputFiles) {
      if (file.size < Config.files.maxSize) {
        const uploadFile: IDocumentUpload = {
          chatID,
          load: 0,
          src: file,
          url: "",
          width: 0,
          height: 0,
          del: false,
          id: -1,
          key: file.name + file.size,
          uploadedSize: 0,
          loadKey: file.name + file.size + chatID + new Date().getTime(),
          duration: 0,
          abortLoad() {/**/},
        };
        sendFiles.push(uploadFile);
      }
    }
    this.formRef.current.reset();
    this.loadFiles(sendFiles);
  }

  public render() {
    const button = (!this.props.store.audioStore.voiceRecording ?
      <div
          onClick={this.click}
          className="documents-upload__icon"
          dangerouslySetInnerHTML={{__html: attauchIcon}}
      /> :
      <div
          onClick={this.voiceRecordingClose}
          className="documents-upload__voice-close"
          dangerouslySetInnerHTML={{__html: voiceCloseIcon}}
      />);

    return(
      <div>
        {button}
        <form name="upload" className="documents-upload__form" ref={this.formRef}>
          <input
            type="file"
            name="myfile"
            ref={this.inputRef}
            className="documents-upload__input"
            multiple={true}
            onChange={this.getFiles}
          />
        </form>
      </div>
    );
  }
  public async loadFiles(files: IDocumentUpload[]): Promise<void> {
    const types = ["image/jpg", "image/jpeg", "image/png"];
    // forEach doesn't work with async/await...
    for (let i = 0; i < files.length; i++) {
      if (types.indexOf(files[i].src.type) === -1) {
        files[i].load = 1;
        continue;
      }
      files[i] = await this.pFileReader(files[i]);
    }
    this.props.store.inputStore.uploadDocuments(files);
  }

  private async pFileReader(file: IDocumentUpload): Promise<IDocumentUpload> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        file = await this.readImage(file, reader.result);
        resolve(file);
      };
      reader.readAsDataURL((file.src as any));
    });

  }

  private readImage(file: IDocumentUpload, result: string | ArrayBuffer): Promise<IDocumentUpload> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = (result as any);
      img.onload = () => {
          file.load = 1;
          file.url = (result as string);
          file.width = img.width;
          file.height = img.height;
          resolve(file);
        };
    });
  }
}
