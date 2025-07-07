import { useFormStatus } from "react-dom";
import axios from 'axios';
import './loginsignup.css';
import logo from '../logo.png'
import ServerLink from "../serverLink";

// const [errorMessage, setErrorMessage] = useState('');


function googleAuth() {
    window.location.href = ServerLink("/auth/google");
}

async function signup(formData) {
    let email = formData.get('email');
    let pass = formData.get('pass');
    let cpass = formData.get('cpass');
    

    // const navigate = useNavigate();

    // setErrorMessage('');

    if(cpass !== pass){ // Corrected logic: passwords do not match
        alert("Passwords do not match!");
        return;
    }
    
    console.log(email);
    try {
        const response = await axios.post(
            ServerLink("/signup"), 
            {email, pass}, 
            {withCredentials: true}
        );
        if(response.data.success) window.location.href = "/portfolio?u=" + response.data.userId;
        else alert("Problem occured, try again!");
    } catch (error) {
        console.log(error)
    }
        

}

function SignUpForm(){
    const { pending } =  useFormStatus();
    return(
        <div className='main'>
            <img src={logo} alt='LinkMake Logo' />
            <form action={signup}>
                <input type='email' name="email" placeholder='Email' required />
                <input type='password' name="pass" placeholder='Password' required />
                <input type='password' name="cpass" placeholder='Confirm Password' required />
                <button type='submit' disabled={pending} > {!pending ? 'Sign Up': 'Creating...'} </button>
            </form><br />
            <button onClick={googleAuth}>
                <i className="fab fa-google"></i>
                Continue with Google
            </button>
             <br />
            <a href="/login" className="aLink">Sign In</a>
        </div>
    );
}

export default SignUpForm;