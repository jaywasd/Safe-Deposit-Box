import React, { useEffect, useState } from "react";
import axios from "axios";

function Chat() {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const safeNumber = localStorage.getItem("safeNumber");
    const bucketName = 'safedepositbucket';

    useEffect(() => {
    }, []);

    let submitHandler = async () => {
        var formData = new FormData();
        var type = document.getElementById('type').value;
        var imagefile = document.querySelector('#file');
        formData.append("file", imagefile.files[0]);
        var name = imagefile.files[0].name;
    
        axios
            .post(process.env.REACT_APP_UPLOAD_API+"/upload/", formData, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
            })
            .then(function (response) {
                let data = response.data;
                alert(data.message);
                if(response.status == 200){
                  axios
                  .get(process.env.REACT_APP_ML_API+"/processImage/"+safeNumber+"/"+email+"/"+name, formData)
                  .then(function (response) {
                      let data = response.data;
                      alert(data.body);
                      if(response.status == 200){
                        if(type == 1){
                          axios
                          .get(process.env.REACT_APP_ML_API+"/compareImage/"+safeNumber+"/"+email+"/"+name, formData)
                          .then(function (response) {
                              let data = response.data;
                              alert(data.message);
                              if(response.status == 200){
                                if(data.similarity > 0){
                                  alert("You can chat now.")
                                  openChatBox();
                                }else{
                                  alert("You can not chat due to no similarity.")                                  
                                }
                              }
                          }).catch(function (error) {
                              console.log(error);
                          });
                        }else{
                          openChatBox();
                        }
                      }
                  }).catch(function (error) {
                      console.log(error);
                  });
                }
            }).catch(function (error) {
                console.log(error);
            });
    }
    const openChatBox = ()=>{
      var iframe = document.createElement('iframe');
      iframe.style.height = "500px";
      iframe.src = 'https://csci-5410-2021.uc.r.appspot.com/';
      document.getElementById("chatBox").appendChild(iframe);
    }
    return (
        <div>
            <div className="row mt-3">
                <div className="col-10">
                    <h1 className="h2">Chat with others</h1>
                </div>
            </div>
            <hr></hr>
            <div className="row">
              <div className="col-md-5">
                <label for="type">Host/Join Chat</label>
                <select className="form-control" id="type" name="type">
                  <option value="0" selected>HOST</option>
                  <option value="1">JOIN</option>
                </select>
              </div>
              <div className="col-md-5">
                <label for="File">Upload Image</label>
                <input type="file" className="form-control" name="file" id="file"/>
              </div>
              <div className="col-md-2">
                <button className="btn btn-primary mt-4" onClick={submitHandler}>SUBMIT</button>
              </div>
            </div>
            <div id="alert_con"></div>
            <div className="row" id="chatBox">
            </div>
        </div>
    );
}
export default Chat;
