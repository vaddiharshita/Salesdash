'use strict';



///
var mysql = require('mysql');
var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "crm"
});
con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

const jwt = require("jsonwebtoken");
module.exports.middleware = async (event, context) => {
  console.log("middleware");
  let token = event.headers.token;
  let verified = await new Promise((resolve, reject) => {
    jwt.verify(event.headers.token, "secretkey", (err, decoded) => {
      if (err) resolve(false);
      resolve(true);
    });
  });
  if (!verified) {
    context.end();
    return { statusCode: 403, body: "Authentication Failed!" };
  }
};
////jest login
module.exports.Login = async (event) => {
  //let request = JSON.parse(event.body);
  let req = event.body;
  let username = req.username;
  let password = req.password;
  let sql =
    "SELECT txtEmail,txtPassword FROM tblusers where txtEmail='" + username + "' and txtPassword='" + password + "';";
  let result = await new Promise((resolve, reject) => {
    if (username == "") {
      resolve({ body: JSON.stringify({ status: "error", Message: "username missing" }) })
      return
    }
    if (password == "") {
      resolve({ body: JSON.stringify({ status: "error", Message: "password missing" }) })
      return
    }
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Result: " + JSON.stringify(result));
      if (result != "") {
        reject("username or password is incorrect");
      } else {
        const token = jwt.sign(
          { username: username, password: password }, "secretkey");
        resolve({ body: "Success: " + JSON.stringify(token) });
      }
    });
  });
  return result;
};










///////get userwith filter*
module.exports.GetUserListWithFilter = async (event) => {
  let request = JSON.parse(event.body);
  let value_filter = request.value_filter;
  let filtername = request.filtername;
  let sql = "select * from tblusers where " + value_filter + "='" + filtername + "' or " + value_filter + " like '" + filtername + "';";
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(JSON.stringify(result))
      resolve({ body: JSON.stringify(result) })
    });
  });
  return result;
}
/////getsingleprofile
module.exports.getsingleprofile = async (event) => {
  let request = JSON.parse(event.body);
  let id = request.id;
  let sql = "select txtSuffix,txtFirstName,txtLastName,txtEmail,txtPassword from tblusers where id  = '" + id + "';"
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Profile  displayed")

      if (result != "") {
        resolve({ body: JSON.stringify(result) })
        return
      }
      else {
        reject("Profile does not exist")
        return
      }
    });
  });
  return result;
};
///////insertuser
module.exports.Insertsingleprofile = async (event) => {
  let request = JSON.parse(event.body);
  let firstname = request.firstname;
  let lastname = request.lastname;
  let email = request.email;
  let password = request.password;
  let sql = "select txtEmail from tblusers where txtEmail =  '" + email + "';"
  let sql1 = "insert into tblusers(txtFirstName,txtLastName,txtEmail,txtPassword) values ('" + firstname + "','" + lastname + "','" + email + "','" + password + "');"
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Result = " + JSON.stringify(result))
      if (result != "") {
        reject("Profile already exists!")
        //resolve({ body: JSON.stringify(result) });
      }
      else if (firstname == "") {
        resolve("Firstname is empty")
        return
      }
      else if (lastname == "") {
        resolve("Lastname is empty")
        return
      }
      else if (email == "") {
        resolve("Email is empty")
        return
      }
      else if (password == "") {
        resolve("Password is empty")
        return
      }
      else {
        con.query(sql1, function (err, result) {
          if (err) throw err;
          console.log("New user profile details inserted")
          resolve({ body: "Record Updated" + JSON.stringify(result) });
        });
      }
    });
  });
  return result;
}

/// updateuser 
module.exports.UpdateSingleProfile = async (event) => {
  let request = JSON.parse(event.body);
  let txtFirstName = request.txtFirstName;
  let email = request.email;
  let txtPassword = request.txtPassword;
  let txtPhonenumber = request.txtPhonenumber;
  let id = request.id;
  let sql1 = "select id,txtFirstName,txtEmail,txtPassword,txtPhonenumber from tblusers where id= '" + id + "'";
  let sql2 = "update tblusers set txtFirstName='" + txtFirstName + "',txtEmail='" + email + "',txtPassword='" + txtPassword + "',txtPhonenumber='" + txtPhonenumber + "' where id='" + id + "';";
  let result = await new Promise((resolve, reject) => {
    con.query(sql1, function (err, result) {
      if (err) throw err;
      if (result != "") {
        con.query(sql2, function (err, result) {
          resolve({ body: "Record Updated" + JSON.stringify(result) })
        })
      }
      else {
        reject("Profile does not exist");
      }
    })
  })
  return result;
};
/////////CampaignProspectwiseCount*
module.exports.CampaignProspectwiseCount = async (event) => {
  let sql = "SELECT tl.refCampaignId, tc.txtCampaignName, tt.txtConversionType, count(txtCampaignName) as count FROM tblcampaign tc  JOIN tblleadcampaignmap tl ON tc.id = tl.refCampaignId  JOIN  tblactivity ta ON tl.id = ta.refMapid    JOIN  tblconversiontype tt ON ta.refConversionStatus = tt.id  where tt.txtConversionType = 'Prospect '  group by tc.txtCampaignName;";
  let result = await new Promise((resolve) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(JSON.stringify(result))
      resolve({ body: JSON.stringify(result) })
    });
  });
  return result;
};
////////////////leadsfunnel
module.exports.leadsfunnel = async (event) => {
  let sql = "select count(id) leadscount from crm.tblleads union all SELECT count(d.txtConversionType) as NoOfLeads FROM crm.tblleads a JOIN crm.tblleadcampaignmap b ON a.id = b.refLeadId JOIN crm.tblactivity c ON b.id = c.refMapid JOIN crm.tblconversiontype d ON c.refConversionStatus = d.id where d.txtConversionType = 'Nurturing ' or d.txtConversionType = 'Prospect ' group by d.txtConversionType;";
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(JSON.stringify(result))
      resolve({ body: JSON.stringify(result) })
    });
  });
  return result;
};
//////////////prospectGrowth
module.exports.prospectGrowth = async (event) => {
  let sql = "SELECT d.txtConversionType, COUNT(d.txtConversionType) as count FROM crm.tblleads a JOIN crm.tblleadcampaignmap b ON a.id = b.refLeadId JOIN crm.tblactivity c ON b.id = c.refMapid JOIN crm.tblconversiontype d ON c.refConversionStatus = d.id WHERE d.txtConversionType = 'Prospect';";
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err
      console.log(JSON.stringify(result))
      resolve({ body: JSON.stringify(result) })
    });
  });
  return result;
};
//////////prospectprogress
module.exports.prospectprogress = async (event) => {
  let sql = "select tct.txtconversiontype,tpt.txtProgresstype from tblactivity ta join tblconversiontype tct on ta.refConversionStatus=tct.id join tblprogresstype tpt on ta.refProgressStatus=tpt.id where tct.txtconversiontype='Prospect ';";
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err
      console.log(JSON.stringify(result))
      resolve({ body: JSON.stringify(result) })
    });
  });
  return result;
}
///////////SalespersonwiseSuccessRate
module.exports.SalespersonwiseSuccessRate = async (event) => {
  let sql = "SELECT tm.refLeadId,tl.txtFirstName,tc.txtConversionType, count(tl.txtFirstName) FROM tblleads tl JOIN tblleadcampaignmap tm ON tl.id = tm.refLeadId JOIN tblactivity ta ON tm.id = ta.refMapid JOIN tblconversiontype tc ON tc.id = ta.refConversionStatus WHERE tc.txtConversionType = 'Prospect ' group by tl.txtFirstName;";
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err
      console.log(JSON.stringify(result))
      resolve({ body: JSON.stringify(result) })
    });
  });
  return result;
}
///////Managerwiseprospectcount
module.exports.Managerwiseprospectcount = async (event) => {
  let sql = "SELECT A.txtJobTitle Jobtitle, B.txtFirstName Name, count(E.txtConversionType) as Count FROM tbljobtitle A JOIN tblusers B ON A.id = B.refJobTitle JOIN tblleadcampaignmap C ON C.refCreatedBy = B.id JOIN   tblactivity D ON D.refMapid = C.id JOIN tblconversiontype E on E.id= D.refConversionStatus where txtJobTitle='%Manager%';";
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(JSON.stringify(result));
      resolve({ body: JSON.stringify(result) });
    });
  });
  return result;
};

////////getsinglelead
module.exports.getlead = async (event) => {
  let request = JSON.parse(event.body);
  let id = request.id;
  let sql = "select txtFirstName,txtCompanyName,txtEmail,txtPhone,txtAddress from tblleads where id = '" + id + "';"
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("result");
      if (result != "") {
        resolve({ body: "Lead Exist" + JSON.stringify(result) })
        return
      }
      else {
        reject("Lead not exist")
        return
      }
    });
  });
  return result;
};
/////////////insertlead
module.exports.insertlead = async (event) => {
  let request = JSON.parse(event.body);
  let firstname = request.firstname;
  let Companyname = request.Companyname;
  let email = request.email;
  let Phone = request.Phone;
  let address = request.address;
  let sql = "select txtEmail from tblleads where txtEmail =  '" + email + "';"
  let sql1 = "insert into tblleads(txtFirstName,txtCompanyName,txtEmail,txtPhone,txtAddress) values ('" + firstname + "','" + Companyname + "','" + email + "','" + Phone + "','" + address + "');"
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Result = " + JSON.stringify(result))
      if (result != "") {
        reject("Profile already exists!")
        return
      }
      if (firstname == "") {
        resolve("Firstname is mandatory")
        return
      }
      if (Companyname == "") {
        resolve("Companyname is mandatory")
        return
      }
      if (email == "") {
        resolve("Email is mandatory")
        return
      }
      if (Phone == "") {
        resolve("Phone is mandatory")
        return
      }
      if (address == "") {
        resolve("address is mandatory")
        return
      }
      else {
        con.query(sql1, function (err, result) {
          if (err) throw err;
          console.log("New user profile details inserted")
          resolve({ body: "profile inserted" + JSON.stringify(result) });
          return
        });
      }
    });
  });
  return result;
};
//////////updatelead
module.exports.updatelead = async (event) => {
  let request = JSON.parse(event.body);
  let firstname = request.firstname;
  let email = request.email;
  let id = request.id;
  let sql = "select id,txtFirstName,txtEmail from tblleads where txtEmail= '" + email + "'";
  let sqlupdate = "update tblleads   set txtEmail='" + email + "'    where id='" + id + "'";
  let result = await new Promise((resolve, reject) => {
    if (firstname == "") {
      resolve("firstname is mandatory");
      return
    }
    if (email == "") {
      resolve("email is mandatory");
      return
    }
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);
      if (result != "") {
        reject("already exist");
      }
    });
    con.query(sqlupdate, function (err, result) {
      if (err) throw err;
      console.log("updated" + result);
      resolve({ body: JSON.stringify(result) });
    });
  });
  return result;
};
//////getcampaign
module.exports.getcampaign = async (event) => {
  let request = JSON.parse(event.body);
  let txtCampaignName = request.txtCampaignName;
  let sql = "SELECT txtCampaignName CampaignName,dtStartdate Startdate,dtEnddate Enddate , count(txtCampaignName) NoOfOwners FROM tblcampaign join tblusers where txtCampaignName = '" + txtCampaignName + "' group by txtCampaignName;";
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("required campaign info");
      if (result != "") {
        resolve({ body: "Campaign info of  selected Campaign" + JSON.stringify(result) })
        return
      }
      else {
        reject("campaign not exist")
        return
      }
    });
  });
  return result;
};
/////////insertcampaign
module.exports.insertcampaign = async (event) => {
  let request = JSON.parse(event.body);
  let Campaignname = request.Campaignname;
  let Producttype = request.Producttype;
  let Startdate = request.Startdate;
  let Enddate = request.Enddate;
  let Createdon = request.Createdon;
  let sql = "insert into tblcampaign(txtCampaignName,refProducttype,dtStartdate,dtEnddate,dtCreatedOn) values('" + Campaignname + "','" + Producttype + "','" + Startdate + "','" + Enddate + "','" + Createdon + "');";
  let result = await new Promise((resolve, reject) => {
    if (Campaignname == "") {
      resolve("Campaignname is mandatory")
      return
    }

    if (Producttype == "") {
      resolve("Producttype is mandatory")
      return
    }
    if (Startdate == "") {
      resolve("Startdate is mandatory")
      return
    }
    if (Enddate == "") {
      resolve("Enddate is mandatory")
      return
    }
    if (Createdon == "") {
      resolve("Createdon is mandatory")
    }
    else {
      reject("Campaign Added Successfully")
    }
  });

};
///////////updatecampaign
module.exports.updatecampaign = async (event) => {
  let request = JSON.parse(event.body);
  let campname = request.campname;
  let id = request.id;
  let sql = "select txtCampaignName  from tblcampaign where id= '" + id + "'";
  let sqlupdate = "update tblcampaign  set txtCampaignName='" + campname + "'    where id='" + id + "'";
  let result = await new Promise((resolve, reject) => {
    if (campname == "") {
      resolve("campname is mandatory");
      return res
    }
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);
      if (result != "") {
        resolve("already exist");
      }
    });
    con.query(sqlupdate, function (err, result) {
      if (err) throw err;
      console.log("updated" + result);
      resolve({ body: JSON.stringify(result) });
    });
  });
  return result;
};
///////////getsingletask jwt
module.exports.GetSingleTask = async (event) => {
  let request = JSON.parse(event.body);
  let id = request.id;
  let sql = "select tasktitle,txtowner,dtStartdate,dtEnddate from tblactivity where id = '" + id + "';";
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(result);
      if (result !== '') {
        resolve({ body: "Task details" + JSON.stringify(result) })
        return
      }
      else {
        reject(" Task does not Exist")
        return
      }
    });
  });
  return (result);
}
///////////jestsingletask 
module.exports.GetSingleTask = async (event) => {
  //let request = JSON.parse(event.body);
  let request = event.body;
  let id = req.id;
  let sql = "select tasktitle,txtowner,dtStartdate,dtEnddate from tblactivity where id = '" + id + "';";
  let result = await new Promise((resolve, reject) => {
    if (id == "") {
      resolve({ body: JSON.stringify({ status: "error", Message: "id missing" }) })
      return
    }

    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Task displayed")

      if (result != "") {
        resolve({ body: "Task exsist" + JSON.stringify(result) });
        return
      }
      else {
        reject(" does not exist")
        return
      }
    });
  });
  return result;
};
////////////////GetTaskListWithFilter jwt
module.exports.GetTaskListWithFilter = async (event) => {
  let request = JSON.parse(event.body);
  let value_filter = request.value_filter;
  let filtername = request.filtername;
  let sql = "select * from tblactivity A join tblactivitytype B on A.refActivitytype=B.id where " + value_filter + "='" + filtername + "' or " + value_filter + " like '" + filtername + "';";
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Result" + result);
      resolve({ body: JSON.stringify(result) })
    });
  });
  return result;
};

////////jestGetTaskListWithFilter
module.exports.GetTaskListWithFilter = async (event) => {
  //let request = JSON.parse(event.body);
  let value_filter = request.value_filter;
  let filtername = request.filtername;
  let sql = "select * from tblactivity A join tblactivitytype B on A.refActivitytype=B.id where " + value_filter + "='" + filtername + "' or " + value_filter + " like '" + filtername + "';";
  let result = await new Promise((resolve, reject) => {
    if (filtername == "") {
      resolve({ body: JSON.stringify({ status: "error", Message: "filtername missing" }) })
      return
    }
    if (value_filter == "") {
      resolve({ body: JSON.stringify({ status: "error", Message: "value_filter missing" }) })
      return
    }
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Result" + result);
      resolve({ body: JSON.stringify(result) });
    });
  });
  return result;
};


/*//
describe("signup api test", () => {
  test("Request with FirstName,LastName,Email,password == repassword", async () => {
      const event = {
          body: {
              FirstName: "honey",
              LastName: "vaddi",
              Email: "abc@123",
              password: "123",
              repassword: "123"
          },
      };
      const res = await handler.login(event);
      expect(res.body).toBe('{"status":"success","Message":"signup"}');
  });
  test("Request with FirstName,LastName,Email,password != repassword", async () => {
      const event = {
          body: {
              FirstName: "honey",
              LastName: "vaddi",
              Email: "abc@123",
              password: "123",
              repassword: "111"
          },
      };
      const res = await handler.login(event);
      expect(res.body).toBe('{"status":"error","Message":"password does bot match"}');
  });
});



///jwt login
module.exports.login = async (event) => {
  let request = JSON.parse(event.body)
  let username = request.username;
  let password = request.password;
  let sql = "SELECT  txtEmail FROM tblusers where txtEmail='" + username + "' and txtPassword='" + password + "'";
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err;
      if (result == "") {
        reject ("username and password is incorrect")}
        else {
        const token = jwt.sign({ username: username, password: password }, "secretkey");
        resolve({ body: JSON.stringify(token) });
        console.log("Login Success:" + JSON.stringify(result));
        resolve({ body: "Success: " + JSON.stringify(token) });
      }
    });
  });
  return result;
};*/

module.exports.getTODO = async (event) => {
  let request = JSON.parse(event.body)
  //let progress = request.progress
  let sql = "select tblactivity.txtDescription,  tblleads.id,tblleads.txtFirstName,tblcampaign.txtCampaignName,tblactivitytype.txtActivitytype,tblprogresstype.txtProgresstype from tblactivity join tblprogresstype on tblactivity.refProgressStatus = tblprogresstype.id join tblactivitytype on tblactivitytype.id = tblactivity.refActivitytype join tblleadcampaignmap on tblactivity.refMapid = tblleadcampaignmap.id join tblcampaign on tblcampaign.id = tblleadcampaignmap.refCampaignId join tblleads on tblleads.id = tblleadcampaignmap.refLeadId";
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err
      console.log(JSON.stringify(result))
      resolve({ body: JSON.stringify(result) })
    });
  });
  return result;
}
/////
module.exports.getinprogress = async (event) => {
  let request = JSON.parse(event.body)
  //let progress = request.progress
  let sql = "select tblactivity.txtDescription,  tblleads.id,tblleads.txtFirstName,tblcampaign.txtCampaignName,tblactivitytype.txtActivitytype,tblprogresstype.txtProgresstype from tblactivity join tblprogresstype on tblactivity.refProgressStatus = tblprogresstype.id join tblactivitytype on tblactivitytype.id = tblactivity.refActivitytype join tblleadcampaignmap on tblactivity.refMapid = tblleadcampaignmap.id join tblcampaign on tblcampaign.id = tblleadcampaignmap.refCampaignId join tblleads on tblleads.id = tblleadcampaignmap.refLeadId where txtprogresstype='In Progress';";
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err
      console.log(JSON.stringify(result))
      resolve({ body: JSON.stringify(result) })
    });
  });
  return result;
}

/////
module.exports.getcompleted = async (event) => {
  let request = JSON.parse(event.body)
  //let progress = request.progress;
  let sql = "select tblleads.id,tblleads.txtFirstName,tblcampaign.txtCampaignName,tblactivitytype.txtActivitytype,tblprogresstype.txtProgresstype from tblactivity join tblprogresstype on tblactivity.refProgressStatus = tblprogresstype.id join tblactivitytype on tblactivitytype.id = tblactivity.refActivitytype join tblleadcampaignmap on tblactivity.refMapid = tblleadcampaignmap.id join tblcampaign on tblcampaign.id = tblleadcampaignmap.refCampaignId join tblleads on tblleads.id = tblleadcampaignmap.refLeadId where txtprogresstype='Completed';";
  let result = await new Promise((resolve, reject) => {
    con.query(sql, function (err, result) {
      if (err) throw err
      console.log(JSON.stringify(result))
      resolve({ body: JSON.stringify(result) })
    });
  });
  return result;
}









