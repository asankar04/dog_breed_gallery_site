import {useState, useEffect} from 'react';
import './App.css';
import DogGallery from './DogGallery';

function App() {
  // Declaring vars and states
  const [breedName, setbreedName] = useState('');
  const [subBreedName, setsubBreedName] = useState('');
  const [quantity, setquantity] = useState();
  const [breedList, setbreedList] = useState([]);
  const [subBreedList, setsubBreedList] = useState([]);
  const [filteredBreedList, setfilteredBreedList] = useState([]);
  const [filteredSubBreedList, setfilteredSubBreedList] = useState([]);  
  const [breedNameStatus, setbreedNameStatus] = useState(false);
  const [showBreeds, setshowBreeds] = useState(false);
  const [showSubBreeds, setshowSubBreeds] = useState(false);
  const [subBreedDisabled, setsubBreedDisabled] = useState(true);
  const [showGallery, setshowGallery] = useState(false);
  const [galleryKey, setgalleryKey] = useState(1);

  // Fetching the initial entire dog breed list
  useEffect(() => {    
    const getList = async() => {
      try {
        const resp = await fetch('https://dog.ceo/api/breeds/list/all')
        const data = await resp.json();
        const breeds = data.message;    
            setbreedList(breeds);                                                 
      } catch (error) {
        console.log(error);
      }
    };
    getList();
  }, []);
  
  // Filtering breed list menu based on input
  useEffect(() => {
    setbreedNameStatus(false);
    setsubBreedDisabled(true);
    if (breedName.length > 0) {      
      setsubBreedName('');
      const breeds = Object.keys(breedList).filter((breed) => 
        breed.toLowerCase().includes(breedName.toLowerCase())
      );
      if (Array.isArray(breeds) && breeds.length > 0) {
        setfilteredBreedList(breeds);     
        setshowBreeds(true);    
      } else {
        setfilteredBreedList([]);        
      }
    } else {
      setfilteredBreedList(Object.keys(breedList));  
      setshowBreeds(false);    
    }
    setshowGallery(false);
  }, [breedName, breedList]);  

  // Fetching sub-breed list
  useEffect(() => {
    if (breedNameStatus) {
      setshowSubBreeds(false);      
      fetch(`https://dog.ceo/api/breed/${breedName}/list`)
        .then(res => res.json())
        .then((data) => {
          const list = data.message;                    
          if (Array.isArray(list) && list.length > 0) {
            setsubBreedList(list);
            setsubBreedDisabled(false);            
          } else {
            setsubBreedList([]);  
            setsubBreedDisabled(true);          
          }
        })        
    }
    setshowGallery(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breedNameStatus]);

  // Filtering sub-breed list menu based on input
  useEffect(() => {
    if (breedNameStatus && (subBreedList.length > 0) && subBreedName.length > 0) {
      const filteredSubBreeds = subBreedList.filter((subBreed) => 
        subBreed.toLowerCase().includes(subBreedName.toLowerCase()));
      if (Array.isArray(filteredSubBreeds) && filteredSubBreeds.length > 0) {
        setfilteredSubBreedList(filteredSubBreeds); 
        setshowSubBreeds(true);     
      } else {
        setfilteredSubBreedList([]);
        setshowSubBreeds(false);
      }
    } else {
      setfilteredSubBreedList(subBreedList);
      setshowSubBreeds(false);
    }
    setshowGallery(false);
  }, [breedNameStatus, subBreedName,subBreedList])

  // Rendering Dog Gallery component
  const handleClick = () => {                    
      setshowBreeds(false);
      setshowSubBreeds(false);
      // Re-renders gallery by updating a prop
      setgalleryKey((key) => key += 1);
      setshowGallery(true);
  }

  return (
    <>
      <div className='container'>
        <div className='nav'>
          <p className='title'>Dog Breed Gallery!</p>          
        </div>
        <div className='input'>
          <div className='breed'>
            <p className='titleText'>Search for Breed</p>
            <input 
              className='search' 
              type="text" 
              value={breedName} 
              onChange={(e) => setbreedName(e.target.value)}
              onClick={() => setshowBreeds(true)} 
              placeholder='Select a breed'
            />
            {showBreeds && (<ul className='breeds'>            
              {filteredBreedList.map(breed => (
                <li key={breed} onClick={() => {setbreedName(breed); setbreedNameStatus(true); setshowBreeds(false); setsubBreedName('')}} className='choice'>{breed}</li>
              ))}
            </ul>)}            
          </div>
          <div className='subBreed'>
            <p className='titleText'>Search for Sub-Breed</p>
            <input 
              className='search' 
              type="text" 
              value={subBreedName} 
              onChange={(e) => setsubBreedName(e.target.value)}    
              onClick={() => breedName ? setshowSubBreeds(true) : setshowSubBreeds(false)}           
              placeholder='Select a sub-breed'
              disabled={subBreedDisabled ? true : false}
            />
            {showSubBreeds && (<ul className='subBreeds'>
              {filteredSubBreedList.map(subBreed => ( 
              <li key={subBreed} onClick={() => {setsubBreedName(subBreed); setshowSubBreeds(false)}} className='choice'>{subBreed}</li>
              ))}
            </ul>)}
          </div>
          <div className='quantity'>
            <p className='titleText'>Quantity (Leave blank for max)</p>
            <input 
              className='search'
              type="number"
              value={quantity}
              onChange={(e) => setquantity(e.target.value)}
              placeholder='Number of images' 
            />
          </div>
        </div>
        <div className='generate'>
          <button className='button' onClick={() => handleClick()}>Generate Gallery</button>
        </div>
        <div className='output'>
          {showGallery &&
          <DogGallery key={galleryKey} breed={breedName} subBreed={subBreedName} quantity={quantity}/>
          }
        </div>
        <div className='end'>
          <p className='credits'>- Made by Anit Sankar -</p>
        </div>
      </div>
    </>
  );
}

export default App;
