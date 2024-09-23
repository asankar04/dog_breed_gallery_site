import {useEffect, useState} from 'react';
import "./App.css"

function DogGallery(props) {
    const [imageArray, setImageArray] = useState([]);
    
    useEffect(() => {        
        if (props.breed && props.subBreed && props.quantity) {
            fetch(`https://dog.ceo/api/breed/${props.breed}/${props.subBreed}/images/random/${props.quantity}`)
                .then(res => res.json())
                .then((data) => setImageArray(data.message));                                            
        } else if (props.breed && props.subBreed) {
            fetch(`https://dog.ceo/api/breed/${props.breed}/${props.subBreed}/images`)
                .then(res => res.json())
                .then((data) => setImageArray(data.message));
        } else if (props.breed && props.quantity) {
            fetch(`https://dog.ceo/api/breed/${props.breed}/images/random/${props.quantity}`)
                .then(res => res.json())
                .then((data) => setImageArray(data.message));
        } else if (props.breed) {
            fetch(`https://dog.ceo/api/breed/${props.breed}/images`)
                .then(res => res.json())
                .then((data) => setImageArray(data.message));
        } else {
            setImageArray([]);
            console.log("No input received");            
        }
    }, [props.breed, props.subBreed, props.quantity]);

    return (
        <>
            <div className="gallery">
                {imageArray.map((image, index) => (                   
                    <img key={index} src={image} alt="dog gallery" className="image" />
                ))}
            </div>
        </>
    )
}

export default DogGallery;