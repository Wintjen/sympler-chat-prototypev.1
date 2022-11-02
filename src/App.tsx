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

export type TFile = {
  source?: string;
  file: File;
}

interface FormIoResponse {
  data: {
    components: [
      {
        data: {
          values: [{
            label: string,
            value: string
          }]
        },
        input: boolean,
        key: string,
        label: string,
        tableView: boolean,
        type: string
      }
    ]
    data: any
    _id: string
  }
}

interface UserResponse {
  index: number,
  message: string,
}

interface dataPost {
  data: {

  }
}

function App() {
  const [formIoData, setFormIoData] = useState<FormIoResponse>()
  const [image, setImage] = useState<TFile[]>([]);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [submit, setSubmit] = useState(false);
  const [index, setIndex] = useState(0)

  const [formSubmissionId, setFormSubmissionId] = useState('')

  const newDate = new Date().toString();

  const sendImageFile = (p: TFile[]) => {
    setImage(p)
    console.log('image has been updated', p)
  }

  useEffect(() => {
    // {{projectUrl}}/form/{{formId}}
    axios.get(`https://mykkomypewprmxq.form.io/funform`).then(res => {
      console.log('get results from formIo', res)
      setFormIoData(res)
    }).catch(error => {
      console.log('get error', error)
    })
  }, [])

  console.log('submtting?', submit)
  console.log('index', index)

  const submitData = async (message: string, index: number) => {
    if (formIoData) {
      if (formIoData.data._id && sessionStarted === false) {
        axios.get(`https://mykkomypewprmxq.form.io/funform/submission/${formIoData.data._id}`).then(res => {
          console.log('the res from formIo submission', res)
        }).catch(async error => {
          console.log('get submission error error', error)
          const key = formIoData.data.components[index].key
          const obj: any = {};
          obj[key] = message
          console.log('first obj', obj)
          await axios.post(`https://mykkomypewprmxq.form.io/funform/submission`, {
            data: {
              ...obj
            }
          }).then(result => {
            console.log('post create submission result', result)
            setFormSubmissionId(result.data._id)
            setSessionStarted(true)
            setIndex(index + 1)
            console.log('this is running lmao')
            setSubmit(false)
          }).catch(error => {
            console.log('error', error)
          })
        })
      } else if (formIoData.data._id && sessionStarted) {
        // Get the previous submissions
        axios.get(`https://mykkomypewprmxq.form.io/funform/submission/${formSubmissionId}`).then(res => {
          console.log('get previous submission', res)
          const previousData = res.data.data
          const key = formIoData.data.components[index].key
          const obj: any = {};
          if (key === 'GDPR') {
            if (message === ('No')) {
              console.log('end it here')
              return
            }
          }
          if (message.includes('data:')) {
            console.log('check me', image[0])
            var formData = new FormData();
            const file = image[0].file
            formData.append('file', file)
            axios.post(`https://dash-api.sympler.co/api/v1/uploadimage`,
              formData,
            ).then(result => {
              console.log('sympler result', result)
              const imageMessage = result.data.file
              obj[key] = imageMessage
              axios.put(`https://mykkomypewprmxq.form.io/funform/submission/${formSubmissionId}`, {
                data: {
                  ...obj,
                  ...previousData
                }
              }).then(result => {
                console.log('result from put', result)
                setIndex(index + 1)
                setSubmit(false)
              }).catch(error => {
                console.log('error', error)
              })
            }).catch(error => {
              console.log('error sending the image to sympler', error)
            })
          } else {
            obj[key] = message
            console.log('obj on put', obj)
            console.log('obj previous', previousData)
            console.log('submission id', formIoData.data._id)
            axios.put(`https://mykkomypewprmxq.form.io/funform/submission/${formSubmissionId}`, {
              data: {
                ...obj,
                ...previousData
              }
            }).then(result => {
              console.log('result from put', result)
              setIndex(index + 1)
              setSubmit(false)
            }).catch(error => {
              console.log('error', error)
            })
          }
        }).catch(error => {
          console.log('couldnt get submission', error)
        })

      }
    }
  }

  const askQuestion = async (message?: string) => {
    if (formIoData) {
      setTimeout( async() => {
        if (index >= formIoData?.data.components.length - 1) {
          console.log('all questions have been answered')
        } else if (formIoData.data.components[index].label.includes('GetTimeZone')) {
          setSubmit(true)
          await submitData(newDate.slice(newDate.indexOf('('), newDate.lastIndexOf(')') + 1), index)
          return
        }
        if (message && submit === false) {
          console.log('image', image)
          await submitData(message, index)
          // addResponseMessage(formIoData.data.components[index].label)
          if (formIoData.data.components[index].data) {
            setQuickButtons(formIoData.data.components[index].data.values ?? [])
          } else {
            setQuickButtons([])
          }
        } else {
          console.log('index before it adds reponse', index)
          addResponseMessage(formIoData.data.components[index].label)
          if (formIoData.data.components[index].data) {
            console.log('hello why is this not working')
            setQuickButtons(formIoData.data.components[index].data.values ?? [])
          } else {
            setQuickButtons([])
          }
          if (message) {
            console.log('askquesion is being run not insided')
            console.log('new message', message)
            await submitData(message, index)
          }
        }
      }, 2000)
    }
  }

  useEffect(() => {
    askQuestion()
  }, [index, formIoData])

  // useEffect(() => {
  //   console.log('image being passed to', image)
  //   if (image.length >= 1) {
  //   }, [image])

  console.log('form', formIoData)

  const hanleQuckButtonClick = (e: string) => {
    addUserMessage(e);
    askQuestion(e);
  };

  useEffect(() => {
    // setQuickButtons(buttons)
    toggleWidget()
  }, []);

  console.log('file?', image)

  return (
    <div className="App">
      <Widget
        handleNewUserMessage={askQuestion}
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