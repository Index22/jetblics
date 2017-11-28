
var express = require('express')
var crypto = require('crypto');
var bigint = require('node-biginteger');
var app = express()


var signature = (message) => {
    const prefix = [48, 32, 48, 12, 6, 8, 42, -122, 72, -122, -9, 13, 2, 5, 5, 0, 4, 16]
    const exponent = bigint.fromString('4802033916387221748426181350914821072434641827090144975386182740274856853318276518446521844642275539818092186650425384826827514552122318308590929813048801')
    const modulus = bigint.fromString('9616540267013058477253762977293425063379243458473593816900454019721117570003248808113992652836857529658675570356835067184715201230519907361653795328462699')
    let md5 = crypto.createHash('md5')
    let md5sum = md5.update(message).digest()
    let hashLength = md5sum.length
    let xLength = hashLength + prefix.length
    let k = Math.ceil(modulus.bitLength() / 8)
    let tempArray = new Array(k)

    tempArray[0] = 0
    tempArray[1] = 1
    for (let i = 2; i < k - xLength - 1; i++) {
        tempArray[i] = 0xff
    }
    for (let i = 0; i < prefix.length; i++) {
        tempArray[k - xLength + i] = prefix[i]
    }
    for (let i = 0; i < hashLength; i++) {
        tempArray[k - hashLength + i] = md5sum[i]
    }

    let tempStr = ''
    for (let i = 0; i < tempArray.length; i++) {
        if (tempStr === '' && tempArray[i] === '0') {
            continue
        }
        let ch = ((tempArray[i] + 0x100) & 0xff).toString(16)
        if (ch.length === 1 && tempStr !== '') {
            tempStr += '0';
        }
        tempStr += ch;
    }
    let m = bigint.fromString(tempStr, 16)
    let s = m.modPow(exponent, modulus).toBuffer()
    let nPadding = tempArray.length - s.length

    for (let i = k-1; i >= 0; i--) {
        if (i >= nPadding) {
            tempArray[i] = s[i - nPadding]
        } else {
            tempArray[i] = 0
        }   
    }
    
    tempStr = ''
    for (let i = 0; i < tempArray.length; i++) {
        let ch = ((tempArray[i] + 0x100) & 0xff).toString(16)
        if (ch.length == 1) {
            tempStr += '0'
        }
        tempStr += ch
    }
    return tempStr
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

app.use(express.static('static'));

app.get('/', (req, res) => {
    res.sendFile('static/index.html');
})

var server = app.listen(8080, () => {
    console.log(`Server started on port`);
})
