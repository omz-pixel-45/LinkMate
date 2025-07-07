import { useFormStatus } from "react-dom";
import { useRef, useState, useEffect } from "react";
import axios from 'axios';
import './details.css';
import logo from '../logo.png'
import ServerLink from "../serverLink";





function DetailsForm(){
    const { pending } =  useFormStatus();
    const [fileName, setFileName] = useState('Choose Profile Picture');
    const [change, setChanged] = useState(false);
    const [allowSubmit, setAllowSubmit] = useState(true);


    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const changeParam = queryParams.get('change');

    
        if(changeParam) setChanged(true);
    }, [])


    async function sendDetail(formData) {
        const queryParams = new URLSearchParams(window.location.search);
        const u = queryParams.get('u');
        if(!allowSubmit){
            alert("Please add an image!");
            return;
        }
        let n = formData.get('nlinks');

        console.log(u)

        formData.append('usrId', u);
        formData.append('change', change);

        
        try {
            const response = await axios.post( ServerLink('/upload'), formData, {
                headers: {
                'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            if(response.data.success) {
                let route = `/links?n=${n}&id=${response.data.id}`;
                if(change) route = `/linkpreview?u=${u}`;
                window.location.href = route;
            }
            else alert("Problem occured! Try Again.");
        } catch (err) {
            console.error('Upload failed:', err);
        }
    
    }

    function choose(e){
        console.log(change)
        const file = e.target.files[0];
        const allowedTypes = ["image/jpeg", "image/png"];
        if (file && allowedTypes.includes(file.type)) {
            setFileName(`Selected file: ${file.name}`);
            setAllowSubmit(true);
        } else {
            setFileName('No file selected or not an image');
            setAllowSubmit(false);
        }
    }

    return(
        <div className='mainDetails main'>
            <img src={logo} alt='LinkMake Logo' />
            <form action={sendDetail}>
                <input type='text' name="fname" placeholder='First Name' required />
                <input type='text' name="lname" placeholder='Last Name' required />
                <input type='text' name="title" placeholder='Title (eg: Trader)' required />
                <textarea name="about" placeholder='What do you want people to know about you...' required />

                <label htmlFor="pic" className="upload-button"> {fileName} </label>
                <input
                    type="file"
                    id="pic"
                    name="pic"
                    accept="image/png, image/jpeg"
                    onChange={choose}
                    style={{ display: 'none' }}
                />

                {
                    !change &&
                    <input type='number' name="nlinks" placeholder='How many links?' required />
                }
                <button type='submit' disabled={pending} > {!pending ? 'Continue': 'Continue...'} </button>
            </form>
        </div>
    );
}

export default DetailsForm;