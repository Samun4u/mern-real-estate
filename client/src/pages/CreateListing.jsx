import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { useState } from 'react'
import { app } from '../firebase';
import {useSelector} from 'react-redux'
import { useNavigate } from 'react-router-dom';

export default function CreateListing() {
  
  const navigate = useNavigate()
  const {currentUser} = useSelector((state) => state.user)
  const [files, setFiles] = useState([]);
  const [imageUploadError, setImageUploadError] = useState(false);
  const [imageUploading, setimageUploading] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false
  })
  const handleImageSubmit = () => {
    if((files.length > 0) && (files.length + formData.imageUrls.length < 7) ){
        setimageUploading(true)
        setImageUploadError(false)
        const promises = [];

        for(let i = 1; i < files.length; i++){
            promises.push(storeImage(files[i]));
        }

        Promise.all(promises).then((urls) => {
            setFormData({
                ...formData, 
                imageUrls: formData.imageUrls.concat(urls) 
            })
            setImageUploadError(false)
            setimageUploading(false)
        }).catch((error) => {
            setImageUploadError('Image upload failed (2 mb max per image)');
            setimageUploading(false)
        })

    }else{
        setImageUploadError('You can upload only 6 images per listing');
        setimageUploading(false)
    } 
  }
  
  const storeImage = async (file) => {
    return new Promise((resolve,reject) => {
        const storage = getStorage(app);
        const fileName = new Date().getTime() + file.name;
        const storageRef = ref(storage,fileName);
        const uploadTask = uploadBytesResumable(storageRef,file);
        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`)
            },
            (error) => {
                reject(error)
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
                    resolve(downloadUrl);
                })
            }
            
        )
    })
  }

  const hanldeRemoveImage = (index) => {
    setFormData({
        ...formData,
        imageUrls: formData.imageUrls.filter((_,i) => i !== index)
    })
  }

  const handleChange = (e) => {

    if(e.target.id === 'sell' || e.target.id === 'rent'){
        setFormData({
            ...formData,
            type: e.target.id
        })
    }

    if(e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer'){
        setFormData({
            ...formData,
            [e.target.id]: e.target.checked 
        })
    }

    if(e.target.type === 'number' || e.target.type === 'text' || e.target.type === 'textarea'){
        setFormData({
            ...formData,
            [e.target.id]: e.target.value 
        })
    }
  }
  const handleSubmit = async(e) => {
    e.preventDefault()
    try{
        if(formData.imageUrls.length < 1) return setError('You must upload one image')
        if(+formData.regularPrice < +formData.discountPrice) return setError('Discount price must be lower then regular price')
        setLoading(true)
        setError(false)

        const res = await fetch('/api/listing/create',{
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                ...formData,
                userRef: currentUser._id
            })
        })

        const data = await res.json();
        setLoading(false)
        if(data.success === false){
            setError(data.message)
        }

        navigate(`/listing/${data._id}`)


    }catch(err){
        setLoading(false)
        setError(err.message)
    }
  }
  console.log(formData)
  return (
    <main className='p-3 max-w-4xl mx-auto'>
        <h1 className='text-3xl font-semibold text-center my-7'>Create a Listing</h1>
        <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
            <div className='flex flex-col gap-4 flex-1'>

                <input 
                    type="text" 
                    placeholder='Name' 
                    className='p-3 rounded-lg border' 
                    maxLength="62" 
                    minLength='10' 
                    id='name'
                    required 
                    onChange={handleChange}
                    value={formData.name}
                    />
                <textarea 
                type="text" 
                placeholder='Description' 
                className='p-3 rounded-lg border' 
                maxLength="62" minLength='10' 
                id='description' required 
                onChange={handleChange}
                value={formData.description}
                />
                <input type="text" placeholder='Address' className='p-3 rounded-lg border' 
                maxLength="62" minLength='10' id='address' required 
                onChange={handleChange}
                value={formData.address}
                />

                <div className='flex gap-6 flex-wrap'>
                    <div className='flex gap-2'>
                        <input type="checkbox" id='sell' className='w-5'
                        onChange={handleChange}
                        checked={formData.type === 'sell'}
                        />
                        <span>Sell</span>
                    </div>
                    <div className='flex gap-2'>
                        <input type="checkbox" id='rent' className='w-5'
                        onChange={handleChange}
                        checked={formData.type === 'rent'}
                        />
                        <span>Rent</span>
                    </div>
                    <div className='flex gap-2'>
                        <input type="checkbox" id='parking' className='w-5'
                        onChange={handleChange}
                        checked={formData.parking}
                        />
                        <span>Parking</span>
                    </div>
                    <div className='flex gap-2'>
                        <input type="checkbox" id='furnished' className='w-5'
                        onChange={handleChange}
                        checked={formData.furnished}
                        />
                        <span>Furnished</span>
                    </div>
                    <div className='flex gap-2'>
                        <input type="checkbox" id='offer' className='w-5'
                        onChange={handleChange}
                        checked={formData.offer}
                        />
                        <span>Offer</span>
                    </div>
                </div>

                <div className='flex flex-wrap gap-6'>
                    <div className='flex items-center gap-2'>
                        <input type="number" className='p-3 border border-gray-300 rounded-lg' 
                        id='bedrooms' min="1" max="10" required
                        onChange={handleChange}
                        value={formData.bedrooms}
                         />
                        <p>Beds</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <input type="number" className='p-3 border border-gray-300 rounded-lg' id='bathrooms' 
                        min="1" max="10" required 
                        onChange={handleChange}
                        value={formData.bathrooms}
                        />
                        <p>Baths</p>
                    </div>
                    <div className='flex items-center gap-2'>
                        <input type="number" className='p-3 border border-gray-300 rounded-lg' 
                        id='regularPrice' min="50" max="1000000" required 
                        onChange={handleChange}
                        value={formData.regularPrice}
                        />
                        <div className='flex flex-col items-center'>
                            <p>Regular Price</p>
                            <span>($ / month)</span>
                        </div>
                    </div>
                    {
                        formData.offer && (
                            <div className='flex items-center gap-2'>
                                <input type="number" className='p-3 border border-gray-300 rounded-lg' 
                                id='discountPrice' min="0" max="100000" required 
                                onChange={handleChange}
                                value={formData.discountPrice}
                                />
                                <div className='flex flex-col items-center'>
                                    <p>Discounted Price</p>
                                    <span>($ / month)</span>
                                </div>
                                
                            </div>
                        )
                    }
                    
                </div>

            </div>
            <div className='flex flex-col flex-1 gap-4'>
                <p className='font-semibold'>Images: <span className='font-normal text-gray-600 ml-2'>The first image will be the cover (max 6)</span></p>
                <div className='flex gap-4'>
                    <input onChange={ (e) => setFiles(e.target.files) } type="file" id='images' className='p-3 border border-gray-300 rounded w-full' accept='image/*' multiple />
                    <button disabled={imageUploading} onClick={handleImageSubmit} className='text-green-700 border p-3 rounded-lg border-green-700 hover:shadow-lg disabled:opacity-80 uppercase'>{ imageUploading ? 'Uploading...' : 'Upload' }</button>
                </div>
                <p className='text-red-700'>{imageUploadError && imageUploadError}</p>
                {
                    formData.imageUrls.length > 0 && formData.imageUrls.map((url,index) => (
                        <div key={url} className='flex justify-between p-3 border items-center'>
                            <img src={url} alt="listing image" className='w-20 h-20 object-contain rounded-lg'/>
                            <button onClick={ () => hanldeRemoveImage(index) } className='text-red-700 p-3 uppercase rounded-lg hover:opacity-75'>Delete</button>
                        </div>
                    ))
                }
                <button disabled={loading || imageUploading} className='p-3 bg-slate-700 text-white uppercase rounded-lg hover:opacity-95 disabled:opacity-80'>{loading ? 'Creating...' : 'Create Listing'}</button>
                <p className='text-red-700'>{error && error}</p>
            </div>
        </form>
    </main>
  )
}
