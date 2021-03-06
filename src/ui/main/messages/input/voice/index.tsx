import * as React from "react";
import { observer, inject } from "mobx-react";
import { IInputStore, IAppStore, IChatStore } from "src/interfaces/store";
import PlayVoiceMessage from "./play";
import VoiceLoading from "./load";
import { IAudioMessage } from "src/models/audio";
import { IRootStore } from "src/store/interfeces";
require("./styles.scss");

interface IVoiceProps {
  store?: IRootStore;
}

@inject("store")
@observer
export default class Voice extends React.Component<IVoiceProps> {
  constructor(props) {
    super(props);
    this.stopRecording = this.stopRecording.bind(this);
  }

  public render() {
    const voiceVolumes = this.props.store.audioStore.voiceVolumes;
    const timeLine: JSX.Element[] = voiceVolumes.slice(0).reverse().map((v, i) =>
      <div
        key={i}
        className="voice-record__timeline__item"
      >
        <div style={{height: (v + 3) + "px"}}/>
      </div>,
    );
    const chatID = this.props.store.chatStore.currentChatID;
    const voiceMessage: IAudioMessage = this.props.store.audioStore.voiceMessages.get(chatID);
    if (voiceMessage) {
      // console.log(voiceMessage);
      if (voiceMessage.load === 1) {
        return(<VoiceLoading />);
      }
      return(<PlayVoiceMessage data={voiceMessage}/>);
    }
    return(
      <div className={"voice-record" + (this.props.store.audioStore.voiceRecording ? "-active" : "")}>
        <div className="voice-record__timeline-wrapper">
          <div className="voice-record__stop" onClick={this.stopRecording}>
            <div/>
          </div>
          <div className="voice-record__timeline">
            {timeLine}
          </div>
          <div className="voice-record__timestop">
            {this.timeStopWidth()}
          </div>
        </div>
      </div>
    );
  }

  private stopRecording() {
    this.props.store.audioStore.stopRecording();
  }

  private timeStopWidth(): number {
    if (this.props.store.audioStore.recoredingStartedAt) {
      let d: number = (new Date()).getTime() - this.props.store.audioStore.recoredingStartedAt.getTime();
      d = Math.floor(60 - d / 1000);
      if (d <= 0) {
        this.stopRecording();
      }
      return d;
    } else {
      return 0;
    }
    // const date = this.props.store.audioStore.
  }

}
