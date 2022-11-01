import React, { useEffect, useState } from 'react';
import { Widget, addResponseMessage, setQuickButtons, addUserMessage, toggleMsgLoader, toggleWidget } from 'drew-react-chat-widget-custom';

import './App.css'
import 'drew-react-chat-widget-custom/lib/styles.css';
import axios from 'axios';

import logo from './sympler-logo.jpeg';

interface MenuItems {
  label: string,
  value: string
}

function App() {
  const [stepOne, setStepOne] = useState(false);
  const [firstQuestion, setFirstQuestion] = useState(true);
  const [secondQuestion, setSecondQuestion] = useState(false);
  const [thirdQuestion, setThirdQuestion] = useState(false);
  const [test, setTest] = useState('');
  const [secondTest, setSecondTest] = useState('');
  const [item, setItem] = useState('');
  const [timesPerMonth, setTimesPerMonth] = useState('');
  const [formIoData, setFormIoData] = useState<any>()
  const [list, setList] = useState<MenuItems[]>([]);
  const [days, setDays] = useState<MenuItems[]>([]);

  useEffect(() => {
    addResponseMessage('Hello, could we ask you some questions about Chipotle? We will store your display name and any message or content you share with us, and we will use this only for research purposes. This study is being conducted by Sympler, a research company. To start suervey, go ahead and click that "OK" button! By clicking "OK", you consent to the collection and use of any information you provide.');
  }, []);

  const handleNewUserMessage = (newMessage: string) => {
    console.log(`New message incoming! ${newMessage}`);
    // Now send the message throught the backend API
    if (newMessage === 'OK' && firstQuestion) {
      setQuickButtons([])
      toggleMsgLoader();
      setTimeout(() => {
        addResponseMessage(formIoData.data.components[0].label)
        setQuickButtons(list)
        setFirstQuestion(false)
        setSecondQuestion(true)
        toggleMsgLoader();
      },1500)
    } else if (newMessage === 'NO THANKS' && firstQuestion) {
      setFirstQuestion(false)
      
      return
    }
    if (newMessage && secondQuestion) {
      setItem(newMessage);
      toggleMsgLoader();
      setQuickButtons([])
      setTimeout(() => {
        addResponseMessage(formIoData.data.components[1].label)
        setQuickButtons(days)
        toggleMsgLoader();
        setSecondQuestion(false)
        setThirdQuestion(true)
      },1500)
    }
    if (newMessage && thirdQuestion) {
      console.log('is this working')
      setTimesPerMonth(newMessage);
      setQuickButtons([])
      toggleMsgLoader();
      setTimeout(() => {
        addResponseMessage('Thanks for chatting! Your input is valuable to us!')
        toggleMsgLoader();
      },1500)
    }
  };

  useEffect(() => {
    // {{projectUrl}}/form/{{formId}}
    axios.get(`https://ajszgfebbsbyxvg.form.io/chipotlechat`).then(res =>{
      console.log('get result', res)
      setFormIoData(res)
      setList(res.data.components[0].data.values.map((e: any) => {
        return e
      }))
      setDays(res.data.components[1].data.values.map((e: any) => {
        return e
      }))
    }).catch(error => {
      console.log('get error', error)
    })
  },[])

  console.log('form',formIoData)

  useEffect(() => {
    if (timesPerMonth !== '') {
      submitForm(); 
    }
  },[timesPerMonth])

  const hanleQuckButtonClick = (e: string) => {
    addUserMessage(e);
    handleNewUserMessage(e);
  };

  let buttons = [
    {
      label: 'OK',
      value: 'OK'
    },
    {
      label: 'NO THANKS',
      value: 'N0 THANKS',
    },
  ];

  useEffect(() => {
    setQuickButtons(buttons)
    toggleWidget()
  },[]);

  const submitForm = async () => {
    console.log(item)
    await axios.post(`https://ajszgfebbsbyxvg.form.io/chipotlechat/submission`, {
      data: {
        whatItemDoYouGet9TimesOutOf10WhenYouEatAtChipotle: item, 
        howManyDaysAMonthDoYouEatAtChipotle: timesPerMonth
      }
    }).then(result =>  {
      console.log('result', result)
    }).catch(error => {
      console.log('error', error)
    })
  }

  const sendImageFile = (p: string) => {
    console.log('image has been updated')
  }

    return (
      <div className="App">
        <Widget
          handleNewUserMessage={handleNewUserMessage}
          profileAvatar={logo}
          title="Messages"
          subtitle="Chipotle Questions"
          handleQuickButtonClicked={hanleQuckButtonClick}
          emojis={false}
          imagePreview={true}
          sendImageFile={sendImageFile}
        />
      </div>
    );
}

export default App;