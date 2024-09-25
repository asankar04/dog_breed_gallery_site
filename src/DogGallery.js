import {useEffect, useState} from 'react';
import "./App.css"

function DogGallery(props) {
    const [imageArray, setImageArray] = useState([]);
    const [arrayStatus, setarrayStatus] = useState(false);
    const [error, seterror] = useState('');
    
    useEffect(() => {    
        const getImages = async(URL) => {
            try {
                const resp = await fetch(URL);
                const data = await resp.json();
                const images = data.message;
                    if (Array.isArray(images) && images.length > 0) {
                        setImageArray(images);
                        setarrayStatus(true);
                    } else {
                        setarrayStatus(false);
                        seterror('No matches found for input');
                    } 
            } catch(error) {
                seterror(error);
            }         
        };

        if (props.breed && props.subBreed && props.quantity) {
            getImages(`https://dog.ceo/api/breed/${props.breed}/${props.subBreed}/images/random/${props.quantity}`);                                                          
        } else if (props.breed && props.subBreed) {
            getImages(`https://dog.ceo/api/breed/${props.breed}/${props.subBreed}/images`);                
        } else if (props.breed && props.quantity) {
            getImages(`https://dog.ceo/api/breed/${props.breed}/images/random/${props.quantity}`);
        } else if (props.breed) {
            getImages(`https://dog.ceo/api/breed/${props.breed}/images`);
        } else {
            setImageArray([]);
            setarrayStatus(false);
            seterror('No input received');                        
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps        
    }, [props.quantity]);

    return (
        <>
            <div className="gallery">
                {arrayStatus ? (imageArray.map((image, index) => (                   
                    <img key={index} src={image} alt="dog gallery" className="image" />
                ))) : (error && console.log(error))}
            </div>
        </>
    )
}

export default DogGallery;