import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Button, Modal, Table } from 'flowbite-react';
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Link } from 'react-router-dom';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../firebase'; // Adjust the path as per your project structure
import './css/itemprofile.css';
import { useReactToPrint } from 'react-to-print';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function PaymentProfile() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [orders, setOrders] = useState([]);
  const [orderIdToDelete, setOrderIdToDelete] = useState('');
  const [showModal, setShowModal] = useState(false);
  const componentPDF = useRef(); // Add reference for PDF generation

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`/api/auth/user/pay/${currentUser._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);

      // Fetch images from Firebase for each order
      data.forEach(order => {
        if (order.profilePicture) {
          fetchFirebaseImage(order.profilePicture, 'profilePicture', order._id);
        }
        if (order.alternateProfilePicture) {
          fetchFirebaseImage(order.alternateProfilePicture, 'alternateProfilePicture', order._id);
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchFirebaseImage = async (imageUrl, field, orderId) => {
    const storageRef = ref(storage, imageUrl);
    try {
      const downloadUrl = await getDownloadURL(storageRef);
      setOrders(prevOrders => prevOrders.map(order => {
        if (order._id === orderId) {
          return {
            ...order,
            [field]: downloadUrl
          };
        }
        return order;
      }));
    } catch (error) {
      console.error(`Error fetching image from Firebase for ${field}:`, error);
    }
  };

  const handleDeleteOrder = async () => {
    try {
      const res = await fetch(`/api/user/deletepay/${orderIdToDelete}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        console.log(data.message);
      } else {
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order._id !== orderIdToDelete)
        );
      }
      
      setShowModal(false);
    } catch (error) {
      console.log(error.message);
    }
  };

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: 'Total Item Report',
    onBeforeGetContent: () => {
      setIsGeneratingPDF(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsGeneratingPDF(false);
      alert('Report downloaded successfully!');
    },
    print: async (printIframe) => {
      const content = printIframe.contentDocument;
      const canvas = await html2canvas(content.body);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('Payment-Report.pdf');
    }
  });

  return (
    <div className="table-auto">
      <h2 className="my-8 text-center font-bold text-4xl text-gray-800">Payment Information</h2>

      <div ref={componentPDF} style={{ width: '100%' }}>
        {orders.length > 0 ? (
          <Table hoverable className="shadow-md">
            <Table.Head>
              <Table.HeadCell>Phone</Table.HeadCell>
              <Table.HeadCell>OrderId</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Payment Method</Table.HeadCell>
              <Table.HeadCell>Card Number</Table.HeadCell>
              <Table.HeadCell>Expiry Date</Table.HeadCell>
              <Table.HeadCell>CVV</Table.HeadCell>
              {!isGeneratingPDF && <Table.HeadCell>Action</Table.HeadCell>}
            </Table.Head>
            <Table.Body>

              {orders.map((order) => (
                <Table.Row key={order._id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell>{order.phone}</Table.Cell>
                  <Table.Cell>{order.order}</Table.Cell>

                  <Table.Cell>{order.email}</Table.Cell>
                  <Table.Cell>{order.p_method}</Table.Cell>
                  <Table.Cell>{order.crd_number}</Table.Cell>
                  <Table.Cell>{order.expd_date}</Table.Cell>

                  
                  <Table.Cell>{order.cvv}</Table.Cell>
                  
               
                  {!isGeneratingPDF && (
                    <Table.Cell>
                      {/* <Link to={`/update-item/${order._id}`}>
                        <Button id="edit-btn" className="text-green-500">
                          <b>Edit Item</b>
                        </Button>
                      </Link> */}
                      <Button id="delete-btn" className="text-red-500" onClick={() => {
                        setShowModal(true);
                        setOrderIdToDelete(order._id);
                      }}>
                        <b>Delete Payment</b>
                      </Button>
                    </Table.Cell>
                  )}
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <p>You have no orders yet!</p>
        )}
      </div>
<br></br>
      {/* <button id='genratebtn' onClick={generatePDF} disabled={isGeneratingPDF}>
        {isGeneratingPDF ? 'Generating PDF...' : 'Generate Report'}
      </button> */}

      <Modal show={showModal} onClose={() => setShowModal(false)} popup size="md">
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
            <h3 className="mb-5 text-lg font-normal text-gray-500">
              Are you sure you want to delete this order?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={handleDeleteOrder}>
                Yes, I am sure
              </Button>
              <Button color="gray" onClick={() => setShowModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
