import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import DeleteIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";

import "./Libros.css";

const Libros = () => {
  const [loanData, setLoanData] = useState([]);
  const [userData, setUserData] = useState({});
  const [bookData, setBookData] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newLoanData, setNewLoanData] = useState({
    idusuario: "",
    idlibro: "",
    fecprestamo: "",
    fecdevolucion: ""
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoanData, setEditLoanData] = useState({
    id: "",
    idusuario: "",
    idlibro: "",
    fecprestamo: "",
    fecdevolucion: ""
  });
  const [deleteLoanId, setDeleteLoanId] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/libros/prestamos/"
        );
        setLoanData(response.data);
        populateUserData(response.data);
        populateBookData(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    const populateUserData = async (data) => {
      const userIds = data.map((loan) => loan.idusuario);
      for (const userId of userIds) {
        try {
          const response = await axios.get(
            `http://127.0.0.1:8000/libros/autores/${userId}/`
          );
          setUserData((prevUserData) => ({
            ...prevUserData,
            [userId]: response.data.nombre
          }));
        } catch (error) {
          console.log(error);
        }
      }
    };

    const populateBookData = async (data) => {
      const bookIds = data.map((loan) => loan.idlibro);
      for (const bookId of bookIds) {
        try {
          const response = await axios.get(
            `http://127.0.0.1:8000/libros/libros/${bookId}/`
          );
          setBookData((prevBookData) => ({
            ...prevBookData,
            [bookId]: response.data
          }));
        } catch (error) {
          console.log(error);
        }
      }
    };

    fetchData();
  }, []);

  const getUserName = (userId) => {
    return userData[userId] || "Cargando...";
  };

  const getBookCode = (bookId) => {
    const book = bookData[bookId];
    return book ? book.codigo : "Cargando...";
  };

  const getBookName = (bookId) => {
    const book = bookData[bookId];
    return book ? book.titulo : "Cargando...";
  };

  const handleCreateModalOpen = () => {
    setShowCreateModal(true);
  };

  const handleCreateModalClose = () => {
    setShowCreateModal(false);
    setNewLoanData({
      idusuario: "",
      idlibro: "",
      fecprestamo: "",
      fecdevolucion: ""
    });
  };

  const handleCreateLoan = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/libros/prestamos/",
        newLoanData
      );
      setLoanData((prevLoanData) => [...prevLoanData, response.data]);
      handleCreateModalClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleEditModalOpen = (loan) => {
    setEditLoanData(loan);
    setShowEditModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setEditLoanData({
      id: "",
      idusuario: "",
      idlibro: "",
      fecprestamo: "",
      fecdevolucion: ""
    });
  };

  const handleUpdateLoan = async () => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/libros/prestamos/${editLoanData.id}/`,
        editLoanData
      );
      const updatedLoanData = loanData.map((loan) =>
        loan.id === response.data.id ? response.data : loan
      );
      setLoanData(updatedLoanData);
      handleEditModalClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteConfirmation = (loanId) => {
    setDeleteLoanId(loanId);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteLoan = async () => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/libros/prestamos/${deleteLoanId}/`
      );
      const updatedLoanData = loanData.filter((loan) => loan.id !== deleteLoanId);
      setLoanData(updatedLoanData);
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setDeleteLoanId(null);
  };

  return (
    <div className="mt-5 m-auto w-75">
      <Button variant="primary" onClick={handleCreateModalOpen}>
        Prestar Libro
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr className="text-center">
            <th>Ejemplar</th>
            <th>Libro</th>
            <th>Cliente</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {loanData.map((loan) => (
            <tr key={loan.id}>
              <td>{getBookCode(loan.idlibro)}</td>
              <td>{getBookName(loan.idlibro)}</td>
              <td>{getUserName(loan.idusuario)}</td>
              <td>{loan.fecprestamo}</td>
              <td>{loan.fecdevolucion}</td>
              <td className="d-flex justify-content-center">
                <button
                  className="btn btn-success mx-2"
                  onClick={() => handleEditModalOpen(loan)}
                >
                  <EditIcon />
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteConfirmation(loan.id)}
                >
                  <DeleteIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showCreateModal} onHide={handleCreateModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Préstar Libro</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formUsuario">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="text"
                placeholder="Usuario"
                value={newLoanData.idusuario}
                onChange={(e) =>
                  setNewLoanData({
                    ...newLoanData,
                    idusuario: e.target.value
                  })
                }
              />
            </Form.Group>

            <Form.Group controlId="formLibro">
              <Form.Label>Libro</Form.Label>
              <Form.Control
                type="text"
                placeholder="Libro"
                value={newLoanData.idlibro}
                onChange={(e) =>
                  setNewLoanData({ ...newLoanData, idlibro: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="formFechaPrestamo">
              <Form.Label>Fecha de Préstamo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Fecha de Préstamo"
                value={newLoanData.fecprestamo}
                onChange={(e) =>
                  setNewLoanData({
                    ...newLoanData,
                    fecprestamo: e.target.value
                  })
                }
              />
            </Form.Group>

            <Form.Group controlId="formFechaDevolucion">
              <Form.Label>Fecha de Devolución</Form.Label>
              <Form.Control
                type="text"
                placeholder="Fecha de Devolución"
                value={newLoanData.fecdevolucion}
                onChange={(e) =>
                  setNewLoanData({
                    ...newLoanData,
                    fecdevolucion: e.target.value
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCreateModalClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleCreateLoan}>
            Crear
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEditModal} onHide={handleEditModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Préstamo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formUsuario">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="text"
                placeholder="Usuario"
                value={editLoanData.idusuario}
                onChange={(e) =>
                  setEditLoanData({
                    ...editLoanData,
                    idusuario: e.target.value
                  })
                }
              />
            </Form.Group>

            <Form.Group controlId="formLibro">
              <Form.Label>Libro</Form.Label>
              <Form.Control
                type="text"
                placeholder="Libro"
                value={editLoanData.idlibro}
                onChange={(e) =>
                  setEditLoanData({ ...editLoanData, idlibro: e.target.value })
                }
              />
            </Form.Group>

            <Form.Group controlId="formFechaPrestamo">
              <Form.Label>Fecha de Préstamo</Form.Label>
              <Form.Control
                type="text"
                placeholder="Fecha de Préstamo"
                value={editLoanData.fecprestamo}
                onChange={(e) =>
                  setEditLoanData({
                    ...editLoanData,
                    fecprestamo: e.target.value
                  })
                }
              />
            </Form.Group>

            <Form.Group controlId="formFechaDevolucion">
              <Form.Label>Fecha de Devolución</Form.Label>
              <Form.Control
                type="text"
                placeholder="Fecha de Devolución"
                value={editLoanData.fecdevolucion}
                onChange={(e) =>
                  setEditLoanData({
                    ...editLoanData,
                    fecdevolucion: e.target.value
                  })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleEditModalClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleUpdateLoan}>
            Guardar cambios
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteConfirmation} onHide={handleCancelDelete}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas eliminar este préstamo?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelDelete}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteLoan}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Libros;
