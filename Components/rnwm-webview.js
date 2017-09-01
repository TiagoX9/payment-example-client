import EventEmitter from "events";
import React, { Component } from "react";
import { WebView as NativeWebView } from "react-native";

export class WebView extends Component {
  constructor(props) {
    super(props);
    this.messagesChannel = new EventEmitter();
  }

  render() {
    return (
      <NativeWebView
        {...this.props}
        onMessage={this.onMessage}
        ref={this._refWebView}
      />
    );
  }

  _refWebView = webview => {
    this.webview = webview;
  };

  onMessage = event => {
    const { data } = event.nativeEvent;
    try {
      const parsedMsg = JSON.parse(data);

      switch (parsedMsg.type) {
        case "json":
          this.messagesChannel.emit("json", parsedMsg.payload);
          break;
        case "text":
          this.messagesChannel.emit("text", parsedMsg.payload);
          break;
        case "event":
          this.messagesChannel.emit(
            parsedMsg.meta.eventName,
            parsedMsg.payload
          );
          break;
      }
    } catch (error) {
      return;
    }
  };

  send(string) {
    this.webview.injectJavaScript(`(function (global) {
      global.RNMessagesChannel && global.RNMessagesChannel.emit('text', ${JSON.stringify(
        string
      )}, true);
    })(window)`);
  }

  sendJSON(json) {
    this.webview.injectJavaScript(`(function (global) {
      global.RNMessagesChannel && global.RNMessagesChannel.emit('json', ${JSON.stringify(
        json
      )}, true);
    })(window)`);
  }

  emit(eventName, eventData) {
    this.webview.injectJavaScript(`(function (global) {
      global.RNMessagesChannel && global.RNMessagesChannel.emit(${JSON.stringify(
        eventName
      )}, ${JSON.stringify(eventData)}, true);
    })(window)`);
  }
}
