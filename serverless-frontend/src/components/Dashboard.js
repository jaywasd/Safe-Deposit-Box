import React, { useEffect, useState } from "react";
import {Chart as ChartJS,CategoryScale,LinearScale,BarElement,Title,Tooltip,Legend} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from "axios";

function Dashboard() {
    const [labels, setLabels] = useState(["###"]);
    const [debits, setDebits] = useState([-10]);
    const [credits, setCredits] = useState([10]);
    const [balance, setBalance] = useState(0);
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    const [values, setValues] = useState({
      type: 'MINUS',
      amount: 0,
      email: email
    });

    const handleChange = (event) => {
      setValues({
        ...values,
        [event.target.name]: event.target.value.trim(),
      });
    };

    let updateChart = async () => {
        axios
            .get(process.env.REACT_APP_ACCOUNT_API + "?type=1&email=" + email)
            .then(function (response) {
              let data = response.data.data;
              let c = data.map((item)=>item.credit);
              let d = data.map((item)=>item.debit);
              let l = data.map((item)=>item.user);
              setCredits(c);
              setDebits(d);
              setLabels(l);
            }).catch(function (error) {
                console.log(error);
            });
    }
    let checkBalance = async () => {
      axios
        .get(process.env.REACT_APP_ACCOUNT_API + "?type=0&email=" + email)
        .then(function (response) {
          setBalance(response.data.balance);
        }).catch(function (error) {
            console.log(error);
        });
    }
    let updateAccount = async () => {
      console.log(values);
      axios
          .post(process.env.REACT_APP_ACCOUNT_API, values)
          .then(function (response) {
            let data = response.data;
            if(data.status == 200){
              setBalance(data.balance);
              updateChart();
            }
            alert(data.message);
          }).catch(function (error) {
              console.log(error);
          });
    }

    useEffect(() => {
      checkBalance();
      updateChart();
    }, []);
    ChartJS.register(
        CategoryScale,
        LinearScale,
        BarElement,
        Title,
        Tooltip,
        Legend
      );
    const options = {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Account History',
          },
        },
    };
    const data = {
        labels,
        datasets: [
          {
            label: 'Debits',
            data: debits,
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Credits',
            data: credits,
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
    };
      
    return (
        <div>
            <div className="row mt-3">
                <div className="col-10">
                    <h1 className="h2">Dashboard</h1>
                </div>
            </div>
            <hr></hr>
            <div className="row">
              <div className="col-md-12"><p>Balance: ${balance}</p></div>
            </div>
            <div className="row">
              <div className="col-md-5">
                <label for="type">Withdraw/Deposit Money</label>
                <select className="form-control" id="type" name="type" onChange={handleChange}>
                  <option value="MINUS" selected>Withdraw</option>
                  <option value="PLUS">Deposit</option>
                </select>
              </div>
              <div className="col-md-5">
                <label for="amount">Amount</label>
                <input type="number" className="form-control" name="amount" id="amount" onChange={handleChange} value={values.amount}/>
              </div>
              <div className="col-md-2">
                <button className="btn btn-primary mt-4" onClick={updateAccount}>SUBMIT</button>
              </div>
            </div>
            <div id="alert_con"></div>
            <div className="row">
                <Bar options={options} data={data} />
            </div>
        </div>
    );
}
export default Dashboard;
