import React, {useEffect} from "react";

interface PayuWidgetProps {
  key: string;
  amount: any;
}

function PayuWidget({key, amount}: PayuWidgetProps) {

  function loadWidget() {
    const widgetConfig = {key:'512323', amount:'20000'};
    payuAffordability.init(widgetConfig);
  }

  function appendScript() {
    let myScript = document.getElementById("payu-affordability-widget");
    if (!myScript) {
      myScript = document.createElement('script');
      myScript.setAttribute('src', "https://jssdk.payu.in/widget/affordability-widget.min.js");
      myScript.id = "payu-affordability-widget";
      document.body.appendChild(myScript);
    }
    myScript.addEventListener('load', loadWidget, true);
  }

  useEffect(() => {
    appendScript();
  }, [])

  return (
    <div id="payuWidget"/>
  )
}

export default PayuWidget;
