import React, { useEffect, useState, useRef } from 'react';
import { Card, Form, Button, Table, Alert, InputGroup } from 'react-bootstrap';

const PRODUCT_API = 'http://localhost:4000/api/product';

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: '', img: '', price: '', category_id: '' });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    fetch(PRODUCT_API).then(res => res.json()).then(setProducts);
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = e => setFile(e.target.files[0]);

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('category_id', form.category_id);
    if (file) {
      formData.append('img', file);
    } else if (editingId && form.img) {
      formData.append('img', form.img);
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${PRODUCT_API}/${editingId}` : PRODUCT_API;
    try {
      const res = await fetch(url, {
        method,
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(editingId ? 'Product updated!' : 'Product created!');
        setForm({ name: '', img: '', price: '', category_id: '' });
        setFile(null);
        setEditingId(null);
        fileInputRef.current.value = '';
        fetch(PRODUCT_API).then(res => res.json()).then(setProducts);
      } else {
        setMessage(data.error || 'Error');
      }
    } catch {
      setMessage('Network error');
    }
  };

  const handleEdit = p => {
    setForm({
      name: p.name,
      img: p.img,
      price: p.price,
      category_id: p.category_id
    });
    setEditingId(p.id);
    setFile(null);
    setMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const res = await fetch(`${PRODUCT_API}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Product deleted!');
        setProducts(products.filter(p => p.id !== id));
      } else {
        setMessage('Delete failed');
      }
    } catch {
      setMessage('Network error');
    }
  };

  return (
    <Card className="product-manager-card">
      <Card.Body>
        <h3 className="manager-title">
          {editingId ? 'Edit Product' : 'Create Product'}
        </h3>
        {message && (
          <Alert variant={message.includes('error') ? 'danger' : 'success'} className="mb-3" dismissible onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}
        <Form onSubmit={handleSubmit} encType="multipart/form-data" className="manager-form">
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Product Name"
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Image</Form.Label>
            <InputGroup>
              <Form.Control
                type="file"
                name="img"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="form-control-custom"
              />
              <InputGroup.Text>
                {file || form.img ? (
                  <img
                    src={file ? URL.createObjectURL(file) : `http://localhost:4000${form.img.replace('./', '/')}`}
                    alt="preview"
                    className="image-preview"
                  />
                ) : (
                  <div className="image-preview-placeholder">No Image</div>
                )}
              </InputGroup.Text>
            </InputGroup>
            {editingId && !file && form.img && (
              <div className="current-image-info">
                Current: <img src={`http://localhost:4000${form.img.replace('./', '/')}`} alt="current" className="current-image-thumb" />
              </div>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Price</Form.Label>
            <Form.Control
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              required
              min={0}
              placeholder="0.00"
              className="form-control-custom"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Category ID</Form.Label>
            <Form.Control
              name="category_id"
              value={form.category_id}
              onChange={handleChange}
              required
              placeholder="Category ID"
              className="form-control-custom"
            />
          </Form.Group>
          <div className="form-buttons">
            <Button type="submit" variant="primary" className="btn-submit">
              {editingId ? 'Update Product' : 'Create Product'}
            </Button>
            {editingId && (
              <Button
                variant="secondary"
                className="btn-cancel"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: '', img: '', price: '', category_id: '' });
                  setFile(null);
                  fileInputRef.current.value = '';
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </Form>
        <h4 className="list-title">Product List</h4>
        <div className="table-container">
          <Table responsive bordered hover className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Image</th>
                <th>Price</th>
                <th>Category ID</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>
                    <img
                      src={`http://localhost:3000${p.img.replace('./', '/')}`}
                      alt={p.name}
                      className="table-image"
                    />
                  </td>
                  <td>${p.price}</td>
                  <td>{p.category_id}</td>
                  <td className="text-center action-buttons">
                    <Button size="sm" variant="warning" className="btn-edit me-2" onClick={() => handleEdit(p)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" className="btn-delete" onClick={() => handleDelete(p.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ProductManager;