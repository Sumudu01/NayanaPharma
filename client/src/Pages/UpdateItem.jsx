import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './css/updateitem.css';
import { app } from '../firebase';
import { getStorage, uploadBytesResumable, ref, getDownloadURL } from 'firebase/storage';

function UpdateUser() {
  const [imagePercent, setImagePercent] = useState(0);
  const navigate = useNavigate();
  const { id } = useParams();
  const fileRef1 = useRef(null);

  const [image1, setImage1] = useState(undefined);
  const [image2, setImage2] = useState(undefined);
  const [updatediscount, setupdatediscount] = useState({
    ProductId: "",
    sup_name:"",
    productName: "",
    stock_quentity: "",
    sold_quentity: "",
    price: "",
    status: "",
  });

  useEffect(() => {
    if (image1) {
      handleFileUpload(image1, 'profilePicture');
    }
  }, [image1]);

  useEffect(() => {
    if (image2) {
      handleFileUpload(image2, 'alternateProfilePicture');
    }
  }, [image2]);

  const handleFileUpload = async (image, field) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + image.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImagePercent(Math.round(progress));
      },
      (error) => {
        console.error('Image upload failed:', error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setupdatediscount((prev) => ({
            ...prev,
            [field]: downloadURL,
          }));
        });
      }
    );
  };

  const handleImage1Click = () => {
    if (fileRef1.current) {
      fileRef1.current.click();
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`/api/user/getitem/${id}`);
        const data = await response.json();
        console.log(data);

        if (data.success) {
          setupdatediscount(data.data);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [id]);

  const handleInputChange = (e) => {
    setupdatediscount({
      ...updatediscount,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/user/updateitem`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: updatediscount._id,
          ...updatediscount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Updated successfully");
        navigate('/inventory/list'); // Updated to correct path
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (

    <div className="service-update">
       <input
        type="text"
        placeholder="sup_name"
        id="sup_name"
        name="sup_name"
        onChange={handleInputChange}
        value={updatediscount?.sup_name}
      />
      <input
        type="text"
        placeholder="ProductId"
        id="ProductId"
        name="ProductId"
        onChange={handleInputChange}
        value={updatediscount?.ProductId}
      />
      <input
        type="text"
        placeholder="productName"
        id="productName"
        name="productName"
        onChange={handleInputChange}
        value={updatediscount?.productName}
      />
      <input
        type="text"
        placeholder="stock qty"
        id="stock_quentity"
        name="stock_quentity"
        onChange={handleInputChange}
        value={updatediscount?.stock_quentity}
      />
      <input
        type="text"
        placeholder="sold qty"
        id="sold_quentity"
        name="sold_quentity"
        onChange={handleInputChange}
        value={updatediscount?.sold_quentity}
      />
      <input
        type="text"
        placeholder="price"
        id="price"
        name="price"
        onChange={handleInputChange}
        value={updatediscount?.price}
      />
      <input
        type="text"
        placeholder="status"
        id="status"
        name="status"
        onChange={handleInputChange}
        value={updatediscount?.status}
      />

      <button className="update-btn" onClick={handleUpdate}>
        Update Details
      </button>
      <br />
      <br />
    </div>
  );
}

export default UpdateUser;
