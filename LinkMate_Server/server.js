const fs = require('fs');
const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors');
const crypto = require('crypto');
const { query } = require('./db');
const session = require('express-session');
const passport = require('passport');
const multer = require('multer');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: true, // use in localhost only
  credentials: true
}));

app.use('/profile_pics', express.static(path.join(__dirname, 'profile_pics')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret_5r4drhh4w3wfgvvnd4wqser76e5sd2asci0067t6rd',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, // 24 hrs
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' // CSRF protection
    } 
}));

app.use(passport.initialize());
app.use(passport.session());

const ENV_KEY = process.env.ENCRYPTION_KEY || "qwerty123456azsxdcfvgbhnjmkloiqs";
if (!ENV_KEY || ENV_KEY.length !== 32) {
    throw new Error("Missing or invalid ENCRYPTION_KEY env variable (must be 32 characters long)");
}
const ENCRYPTION_KEY = Buffer.from(ENV_KEY);
const IV_LENGTH = 16;

function encrypt(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

const isAuthenticated = (req, res, next) => {
    console.log(req.session)
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ success: false, message: "Unauthorized" });
    }
};


async function delpic(usrId) {
    const prev = await query(`
        SELECT profil_pic FROM user_info
        WHERE userId = ? LIMIT 1`,
        [usrId]
    );
    
    if (prev.length > 0 && prev[0].profil_pic) {
        const oldPrefix = prev[0].profil_pic;
        const folderPath = path.join(__dirname, 'profile_pics');
        const fileToDelete = findFile(folderPath, oldPrefix); // your existing function
    
        if (fileToDelete) {
        const fullPath = path.join(folderPath, fileToDelete);
        fs.unlinkSync(fullPath); // delete the old file
        console.log(`✅ Deleted old pic: ${fileToDelete}`);
        } else {
        console.log(`⚠️ No old pic found starting with: ${oldPrefix}`);
        }
    }
}

async function genPicName() {
  let unique = false;
  let generated;

  while (!unique) {
    // Generate a random 8-digit string
    generated = Math.floor(10000000 + Math.random() * 90000000).toString();

    const rows = await query(
      `SELECT profil_pic FROM user_info WHERE profil_pic = ?`,
      [generated]
    );

    if (rows.length === 0) {
      unique = true;
    }
  }

  return generated;
}

let currPicNumb;



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'profile_pics/');
  },
  filename: async (req, file, cb) => {
    currPicNumb = await genPicName();
    cb(null, currPicNumb + '-' + file.originalname);
  },
});

const upload = multer({ storage });


function findFile(dirPath, prefix) {
    const files = fs.readdirSync(dirPath);
    for (let file of files) {
        if (file.substring(0, 8) === prefix) {
        return file; // Found it
        }
    }

    return null; // No match found
}


// For google login
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use(new GoogleStrategy({
    clientID: '136586707224-066bhgfeb3hk8tinf22eag5fe36j201l.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/'
}), async (req, res) => {
    const email = (req.user && req.user.emails && req.user.emails[0] && req.user.emails[0].value) || 'noemail@unknown.com';

    try {
        const results = await query("SELECT * FROM users WHERE email = ?", [email]);
        let route = `http://localhost:3000`

        if (results.length > 0) {
            route += `/linkpreview?u=${results[0].userId}`;
        } else {
            const result = await query("INSERT INTO users (email, password) VALUES (?, ?)", 
                [email, 'gmail']
            );

            route += `/portfolio?u=${result.insertId}`;
        }

        req.session.user = {
            email: email,
            loginTime: Date.now()
        };
        
        return res.redirect(route);
        
        
    } catch (err) {
        console.error("Google callback error:", err);
        res.redirect('/');
    }
});


// -- LinkMata --
app.post("/login", async (req,res) => {
    try {
        const { email, pass} = req.body;
        const results = await query("SELECT * FROM users WHERE email = ?", [email]);

        if (results.length === 1) {
            const user = results[0];

            if(user.password === 'gmail') return res.json({success: false, gmail: true});

            const decrypted = decrypt(user.password);
            if (decrypted == pass) {
                const email = user.email;
                req.session.user = {
                    email: email,
                    loginTime: Date.now()
                };

                return res.json({success: true, userId: user.id});
            }

            return res.json({success: false, passFail: true});
        }
        console.log("Getting login")
        return res.json({success: false});        

    } catch (err) {
        console.error("Error in /checkUser:", err);
        return res.json({success: false});
    }
});


app.post("/signup", async (req,res) => {
    try {
        const { email, pass } = req.body;
        const results = await query("SELECT * FROM users WHERE email = ?", [email]);

        if (results.length > 0) {
            return res.json({success: false, exists: true});
        }
        else{            
            const encryptedPass = encrypt(pass);

            const result = await query("INSERT INTO users(email, password) VALUES(?, ?)", [email, encryptedPass]);
            
            console.log("User: ", email, " created successfully!");

            req.session.user = {
                email: email,
                loginTime: Date.now()
            };
            return res.json({success: true, userId: result.insertId});
        }        

    } catch (err) {
        console.error("Error in /signup", err);
        return res.json({success: false});
    }
});


app.post("/user-check", async (req, res) => {
    try {
        const { pass, userId } = req.body;

        if (!pass || !userId) {
            return res.json({ isCorrect: false, error: 'Missing credentials' });
        }

        const results = await query("SELECT * FROM users WHERE id = ?", [userId]);

        if (results.length === 1) {
            const user = results[0];

            const decrypted = decrypt(user.password);
            if (decrypted === pass) {
                return res.json({ isCorrect: true });
            } else {
                return res.json({ isCorrect: false });
            }
        }

        return res.json({ isCorrect: false });

    } catch (err) {
        console.error("Error in /user-check:", err);
        return res.json({ isCorrect: false });
    }
});



app.post('/upload', upload.single('pic'), async (req, res) => {
    const { fname, lname, title, about, usrId, change } = req.body;
    const timestamp = new Date();
    // const pic = req.file?.filename || null;

    console.log(req.file, timestamp, req.body);

    try {
        const isUpdate = change === 'true';
        if (isUpdate) {
            delpic(usrId);
            await query(`
                UPDATE user_info
                SET firstName = ?, lastName = ?, title = ?, about = ?, profil_pic = ?, timestamp = ?
                WHERE userId = ?`,
                [fname, lname, title, about, currPicNumb, timestamp, usrId]
            );
            res.json({ success: true, updated: true, id: usrId });
        } else {
            await query(`
                INSERT INTO user_info(userId, firstName, lastName, title, about, profil_pic, timestamp)
                VALUES(?, ?, ?, ?, ?, ?, ?)`,
                [usrId, fname, lname, title, about, currPicNumb, timestamp]
            );
            res.json({ success: true, created: true, id: usrId });
        }
    } catch (error) {
        console.error(error, "upload err");
        res.json({ success: false });
    }
});



app.post('/links', async (req, res) => {
    const { links, uId } = req.body;
    try{
        for(let link of links){
            await query(`
                INSERT INTO links (link, name, type, userId)
                VALUES (?, ?, ?, ?)`,
                [link.url, link.name, link.type, uId]
            );
        }
        return res.json({success: true, userId: uId});
    }catch(err){
        console.log("Links err: ", err);
        return res.status(400).json({success: false});
    }
});


app.get("/getLinks", async (req, res) => {
    const u = req.query.u;
    try{
        const linksArray = await query(`
            SELECT * FROM links
            WHERE userId = ?`,
            [u]
        );
        console.log(linksArray)
        return res.json({links: linksArray});
    }catch(err){
        console.log("Links err: ", err);
        return res.status(400).json({success: false});
    }
});

app.post("/updlinks", async (req, res) => {
    const { links, uId } = req.body;
    try{
        await query(`
            DELETE FROM links
            WHERE userId = ?`,
            [uId]
        );
        for(let link of links){
            await query(`
                INSERT INTO links (link, name, type, userId)
                VALUES (?, ?, ?, ?)`,
                [link.link, link.name, link.type, uId]
            );
        }
        return res.json({success: true, userId: uId});
    }catch(err){
        console.log("Links err: ", err);
        return res.status(400).json({success: false});
    }
})


app.post('/preview', async (req, res) => {
    const u = req.body.u;
    
    console.log(`Received request for user ID: ${u}`);
    console.log(req.session)

    // Simulate fetching data based on 'u'
    

    try {
        const links = await query("SELECT  * FROM links WHERE userId = ?", [u]);

        const userArray = await query("SELECT  * FROM user_info WHERE userId = ?", [u]);
        const user = userArray[0];

        const picPath = "http://localhost:3500/profile_pics/"+ findFile(path.join(__dirname, 'profile_pics'), user.profil_pic);

        const updatedLinks = links.map(link => {
            const capitalizedType = link.type.charAt(0).toUpperCase() + link.type.slice(1);
            return {
                ...link,
                type: link.type.toLowerCase()
            };
        });

        const shareLink = `http://localhost:3000/linkshare?u=${u}`

        
        const data = {
            picLinkPath: picPath,
            fname: user.firstName,
            lname: user.lastName,
            workTitle: user.title,
            about: user.about,
            links: updatedLinks,
            shareLink: shareLink
        };
        

        res.json(data);

    } catch (error) {
        console.log('preview err: ', error);
        res.status(400).json({data: "bad"});
    }
});



server.listen(3500, '0.0.0.0', () => {
    console.log("Server running on http://localhost:3500");
    console.log("\nListening for requests...\n");
});
