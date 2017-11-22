
var express = require('express')
var nodersa = require('node-rsa')
var app = express()


var signature = (message) => {
    let pv = `-----BEGIN RSA PRIVATE KEY-----
MIIBOwIBAAJBALecq3BwAI4YJZwhJ+snnDFj3lF3DMqNPorV6y5ZKXCiCMqj8OeO
mxk4YZW9aaV9ckl/zlAOI0mpB3pDT+Xlj2sCAwEAAQJAW6/aVD05qbsZHMvZuS2A
a5FpNNj0BDlf38hOtkhDzz/hkYb+EBYLLvldhgsD0OvRNy8yhz7EjaUqLCB0juIN
4QIhAMsJQ3xiJemnJ2pD65iRNCC/Kr7jtxbbBwa6ZFLjp12pAiEA54JCn41fF8GZ
90b9L5dtFQB2/yIcGX4Xo7bCvl8DaPMCIBgOZ+2T33QYtwXTOFXiVm/O1qy5ZFcT
6ng0m3BqwsjJAiEAqna/l7wAyP1E4U7kHqbhKxWsiTAUgLDXtzRbMNHFMQECIQCA
xlpXEPqnC3P8if0G9xHomqJ531rOJuzB8fNtRFmxnA==
-----END RSA PRIVATE KEY-----`
    let rsa = new nodersa(pv)
    rsa.setOptions({signingSchema: 'md5'})
    return rsa.sign(message, 'hex')
}

app.get('*/ping.action', (req, res) => {
    console.log('ping')    
    let xml = `<PingResponse><message></message><responseCode>OK</responseCode><salt>${req.query.salt}</salt></PingResponse>`
    res.set('Content-Type', 'text/xml')
    res.send(`<!-- ${signature(xml)} -->` + '\n' + xml)
})

app.get('*/obtainTicket.action', (req, res) => {
    console.log('obtain ticket')
    let xml = `<ObtainTicketResponse><message></message><prolongationPeriod>607875500</prolongationPeriod>`
    xml += `<responseCode>OK</responseCode><salt>${req.query.salt}</salt><ticketId>1</ticketId>`
    xml += `<ticketProperties>licensee=${req.query.userName}\tlicenseType=0\t</ticketProperties></ObtainTicketResponse>`
    res.set('Content-Type', 'text/xml')
    console.log(req.query)
    res.send(`<!-- ${signature(xml)} -->` + '\n' + xml)
})

app.get('*/releaseTicket.action', (req, res) => {
    res.status(301)
    return '301 Not accept'
})

app.get('*/prolongTicket.action', (req, res) => {
    let xml = `<ProlongTicketResponse><message></message><responseCode>OK</responseCode>`
    xml += `<salt>${req.query.salt}</salt><ticketId>${req.query.ticketId}</ticketId></ProlongTicketResponse>`
    res.set('Content-Type', 'text/xml')
    res.send(`<!-- ${signature(xml)} -->` + '\n' + xml)
})

app.get('/', (req, res) => {
    res.send('hello world');
})



var server = app.listen(8080, () => {
    console.log(`Server started on port`);
})