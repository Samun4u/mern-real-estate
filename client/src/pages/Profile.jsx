import { useEffect, useRef, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteUserFailure, deleteUserStart, deleteUserSuccess, signOutFailure, signOutStart, signOutSuccess } from "../redux/user/userSlice";
import { Link } from 'react-router-dom';


export default function Profile() {

  const { currentUser, loading, error } = useSelector((state) => state.user);
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [showListingsErrorMsg, setShowListingsErrorMsg] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();
 
 
  // console.log(formData);
  
  //firebase storage rule
  // allow read;
  // allow write: if 
  // request.resource.size < 2 * 1024 *1024 &&
  // request.resource.contentType.matches('image/.*')

  useEffect(() => {

    if(file){
      handleFileUpload(file);
    }

  },[file]);

  const handleFileUpload = (file) => {

    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFilePerc(Math.round(progress));
          // console.log('Upload is '+ progress +' % Done');
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setFormData({ ...formData, avatar: downloadURL })
        })
      }

    )
  }

  const handleChange = (e) => {
    setFormData({...formData, [e.target.id]: e.target.value});
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
   

    try{

      dispatch(updateUserStart());

      const res = await fetch(`/api/user/update/${currentUser._id}`,{
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if(data.success === false){
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);

    }catch(error){
        dispatch(updateUserFailure(error.message));
    }
  }

  const handleDeleteUser = async () => {
    try{
      dispatch(deleteUserStart())

      const res = await fetch(`/api/user/delete/${currentUser._id}`,{
        method: "DELETE"
      });

      const data = await res.json()
      if(data.success === false){
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data))

    }catch(error){
      dispatch(deleteUserFailure(error.message));
    }
  }

  const handleSignOut = async () => {
    try{
      dispatch(signOutStart())
      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if(data.sccess === false){
        dispatch(signOutFailure(data.error));
        return;
      }
      dispatch(signOutSuccess(data));
    }catch(error){
      dispatch(signOutFailure(error))
    }
  }

  const handleShowListings = async () => {
    
      try{
        setShowListingsError(false)

        const res = await fetch(`/api/user/listings/${currentUser._id}`)
        const data = await res.json();

        if(data.success === false){
          setShowListingsError(true);
          setShowListingsErrorMsg(data.message);
          return;
        }
        
        setUserListings(data);
        
      }catch(error){
        setShowListingsError(true);
        setShowListingsErrorMsg(error.message);
      }
  }

  const handleListingDelete = async (listingId) => {
    try {

      const res = await fetch(`/api/listing/delete/${listingId}`,{
        method: 'DELETE',
      });
      const data = await res.json();

      if(data.success === false){
        console.log(data.message);
        return;
      }

      setUserListings((prev) => 
        prev.filter((listing) => listing._id !== listingId)
      );
      
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="p-3 max-w-lg mx-auto">
        <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input onChange={ (e) => setFile(e.target.files[0]) } type="file" accept="image/*" ref={fileRef}  hidden />
          <img 
            src={ formData.avatar || currentUser.avatar } alt="profile" 
            className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2" 
            onClick={ () => fileRef.current.click() }
          />
          <p>
            { fileUploadError ? (<span className="text-red-700">Image Upload Error(Image must be less then 2mb)</span>) : (filePerc > 0 && filePerc < 100) ? (<span className="text-slate-700"> {`Uploading ${filePerc}%`} </span>) : (filePerc === 100) ? (<span className="text-green-700">Image successfully Uploaded!</span>) : "" }
          </p>
          <input type="text" placeholder="username" id="username"  className="border p-3 rounded-lg" defaultValue={currentUser.username}  onChange={handleChange}/>
          <input type="email" placeholder="email" id="email" className="border p-3 rounded-lg" defaultValue={currentUser.email} onChange={handleChange} />
          <input type="password" placeholder="password" id="password" className="border p-3 rounded-lg"  onChange={handleChange}/>
          <button disabled={loading} className="bg-slate-700 text-white p-3 rounded-lg hover:opacity-95 disabled:opacity-80 uppercase">{loading ? 'Loading...' : 'Update'}</button>
          <Link to={"/create-listing"} className="bg-green-700 p-3 text-white rounded-lg text-center uppercase">Create Listing</Link>
        </form>

        <div className="flex justify-between mt-5">
            <span onClick={handleDeleteUser} className="text-red-700 cursor-pointer">Delete account</span>
            <span onClick={handleSignOut} className="text-red-700 cursor-pointer">Sign out</span>
        </div>

        <p className="text-red-700 mt-5">{error ? error : ''}</p>
        <p className="text-green-700 mt-5">{updateSuccess ? 'User is updated successfully!' : ''}</p>

        <button onClick={handleShowListings} className="text-green-700 w-full">Show Listings</button>
        <p className="text-red-700 mt-5">{showListingsError  && showListingsErrorMsg ? showListingsErrorMsg : ''}</p>

        {userListings && userListings.length > 0 && 
        
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold">Your Listings</h1>
            {userListings.map(
              (listing) => (
                <div key={listing._id} className="p-3 flex justify-between items-center gap-4">
                    <Link to={`/listing/${listing._id}`}>
                      <img 
                        src={listing.imageUrls[0]} 
                        alt="listing cover" 
                        className="h-16 w-16 flex object-contain"
                      />
                    </Link>
                    <Link to={`/listing/${listing._id}`}>
                      <p className="text-slate-700 font-semibold flex-1 hover:underline truncate">{listing.name}</p>
                    </Link>
                    <div className="flex flex-col items-center">
                    <button onClick={() => handleListingDelete(listing._id)} className="text-red-700 uppercase">Delete</button>
                    <Link to={`/update-listing/${listing._id}`}>
                      <button className="text-green-700 uppercase">Edit</button>
                    </Link>
                    </div>
                </div>
              )
            )
          }
        </div>
        }

    </div>
  )
}
