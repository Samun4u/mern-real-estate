import { useEffect, useRef, useState } from "react"
import { useSelector } from "react-redux"
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";

export default function Profile() {
  const fileRef = useRef(null);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const { currentUser } = useSelector((state) => state.user);

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

  return (
    <div className="p-3 max-w-lg mx-auto">
        <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
        <form className="flex flex-col gap-4">
          <input onChange={ (e) => setFile(e.target.files[0]) } type="file" accept="image/*" ref={fileRef}  hidden />
          <img 
            src={ formData.avatar || currentUser.avatar } alt="profile" 
            className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2" 
            onClick={ () => fileRef.current.click() }
          />
          <p>
            { fileUploadError ? (<span className="text-red-700">Image Upload Error(Image must be less then 2mb)</span>) : (filePerc > 0 && filePerc < 100) ? (<span className="text-slate-700"> {`Uploading ${filePerc}%`} </span>) : (filePerc === 100) ? (<span className="text-green-700">Image successfully Uploaded!</span>) : "" }
          </p>
          <input type="text" placeholder="username" className="border p-3 rounded-lg" />
          <input type="email" placeholder="email" className="border p-3 rounded-lg" />
          <input type="password" placeholder="password" className="border p-3 rounded-lg" />
          <button className="bg-slate-700 text-white p-3 rounded-lg hover:opacity-95 disabled:opacity-80">Update</button>
        </form>

        <div className="flex justify-between mt-5">
            <span className="text-red-700 cursor-pointer">Delete account</span>
            <span className="text-red-700 cursor-pointer">Sign out</span>
        </div>

    </div>
  )
}
