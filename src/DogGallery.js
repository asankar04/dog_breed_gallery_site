import {useEffect, useState} from 'react';
import "./App.css"

function DogGallery(props) {
    const [imageArray, setImageArray] = useState([]);
    const [arrayStatus, setarrayStatus] = useState(false);
    
    useEffect(() => {    
        const getImages = (URL) => {
            fetch(URL)                
            .then(res => res.json())
            .then((data) => {
                const images = data.message;
                if (Array.isArray(images) && images.length > 0) {
                    setImageArray(images);
                    setarrayStatus(true);
                } else {
                    setarrayStatus(false);
                }
            })  
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
            console.log("No input received");            
        }        
    }, [props.breed, props.subBreed, props.quantity]);

    return (
        <>
            <div className="gallery">
                {arrayStatus ? (imageArray.map((image, index) => (                   
                    <img key={index} src={image} alt="dog gallery" className="image" />
                ))) : (console.log("Please enter valid input"))}
            </div>
        </>
    )
}

export default DogGallery;