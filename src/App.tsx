import React, { useEffect, useState } from 'react';
import { Widget, addResponseMessage, setQuickButtons, addUserMessage, toggleMsgLoader, toggleWidget } from 'react-chat-widget';
import './App.css'
import 'react-chat-widget/lib/styles.css';

import logo from './logo.svg';

function App() {
  const [stepOne, setStepOne] = useState(false);
  const [firstQuestion, setFirstQuestion] = useState(true);
  const [secondQuestion, setSecondQuestion] = useState(false);
  const [thirdQuestion, setThirdQuestion] = useState(false);
  const [test, setTest] = useState('');
  const [secondTest, setSecondTest] = useState('');

  useEffect(() => {
    addResponseMessage('Hello, could we ask you some questions about Chipotle? ![vertical](https://upload.wikimedia.org/wikipedia/en/thumb/3/3b/Chipotle_Mexican_Grill_logo.svg/800px-Chipotle_Mexican_Grill_logo.svg.png)');
  }, []);

  const handleNewUserMessage = (newMessage: string) => {
    console.log(`New message incoming! ${newMessage}`);
    // Now send the message throught the backend API
    if (newMessage === 'Yes' && firstQuestion) {
      setQuickButtons([])
      toggleMsgLoader();
      setTimeout(() => {
        addResponseMessage('What item do you get 9 times out of 10 when you eat at Chipotle?')
        setQuickButtons(chipotleItems)
        setFirstQuestion(false)
        setSecondQuestion(true)
        toggleMsgLoader();
      },1500)
    } else if (newMessage === 'No' && firstQuestion) {
      setFirstQuestion(false)
      return
    }
    if (newMessage && secondQuestion) {
      toggleMsgLoader();
      setQuickButtons([])
      setTimeout(() => {
        addResponseMessage('How many days a month do you eat at Chipotle?')
        setQuickButtons(perMonth)
        toggleMsgLoader();
        setSecondQuestion(false)
        setThirdQuestion(true)
      },1500)
    }
    if (newMessage && thirdQuestion) {
      console.log('is this working')
      setQuickButtons([])
      toggleMsgLoader();
      setTimeout(() => {
        addResponseMessage('Thanks for chatting! Your input is valuable to us!')
        toggleMsgLoader();
      },1500)
    }
  };

  const hanleQuckButtonClick = (e: string) => {
    addUserMessage(e);
    handleNewUserMessage(e);
  }

  let chipotleItems = [
    {
      label: 'Burrito',
      value: 'Burrito'
    },
    {
      label: 'Burrito Bowl',
      value: 'Burrito Bowl'
    },
    {
      label: 'Lifestyle Bowl',
      value: 'Lifestyle Bowl'
    },
    {
      label: 'Quesadilla',
      value: 'Quesadilla'
    },
    {
      label: 'Salad',
      value: 'Salad'
    },
    {
      label: 'Tacos',
      value: 'Tacos'
    },
  ]

  let perMonth = [
    {
      label: '1-2',
      value: '1-2'
    },
    {
      label: '3-7',
      value: '3-7'
    },
    {
      label: '8-14',
      value: '8-14'
    },
    {
      label: '15+',
      value: '15+'
    }
  ]

  let buttons = [
    {
      label: 'Yes',
      value: 'Yes'
    },
    {
      label: 'No',
      value: 'No',
    },
  ];

  useEffect(() => {
    setQuickButtons(buttons)
    toggleWidget()
  },[])

  console.log('test', test)
  console.log('2nd test', secondTest)

    return (
      <div className="App">
        <Widget
          handleNewUserMessage={handleNewUserMessage}
          profileAvatar={logo}
          title="Title"
          subtitle="Subtitle"
          handleQuickButtonClicked={hanleQuckButtonClick}
          emojis={true}
          fullScreenMode={true}
          imagePreview
        />
      </div>
    );
}

export default App;