const PORT=process.env.PORT||3000;
const express=require('express');
const app=express();
const cors=require('cors');
app.use(cors());

app.get('/',async(request,response)=>{
  try{

    const expiryurl='https://www.nseindia.com/api/option-chain-contract-info?symbol=NIFTY';

    const expiry=await fetch(expiryurl,{
      headers:{
        'User-Agent':'Mozilla/5.0',
        'Accept-Encoding':'gzip,br,deflate',
        'Accept-Language':'en,en-US,q=0.9'
      }
    });


    const aliveit=await expiry.json();
    const workingexp=aliveit.expiryDates[0];
    console.log(workingexp);//current expiry


    const targetUrl=`https://www.nseindia.com/api/option-chain-v3?type=Indices&symbol=NIFTY&expiry=${workingexp}`;

    const flatString=await fetch(targetUrl,{
      headers:{
        'User-Agent':'Mozilla/5.0',
        'Accept-Encoding':'gzip,br,deflate',
        'Accept-Language':'en-US,en,q=0.9'
      }
    });

    console.log(targetUrl);
    const realobject=await flatString.json();
    // console.log(realobject);
    
    //now we have to stringify realobject  to send it over internet to our html page
    response.json(realobject);
    console.log('response sent');
    // console.log(realobject);


  }

  catch(error){
    console.log('Failed to load');
  }
});


app.listen(PORT,()=>{

  console.log(`Server started with PORT: ${PORT}`);

});