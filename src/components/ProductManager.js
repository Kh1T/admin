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
    <Card style={{ boxShadow: '0 2px 16px #eee', borderRadius: 16, marginBottom: 32 }}>
      <Card.Body>
        <h3 style={{ fontWeight: 'bold', color: '#c81b84', textAlign: 'center' }}>
          {editingId ? 'Edit Product' : 'Create Product'}
        </h3>
        {message && (
          <Alert variant={message.includes('error') ? 'danger' : 'success'} className="mb-3" dismissible onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control name="name" value={form.name} onChange={handleChange} required placeholder="Product Name" />
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
              />
              {(file || form.img) && (
                <InputGroup.Text>
                  <img
                    src={file ? URL.createObjectURL(file) : `http://localhost:4000${form.img.replace('./', '/')}`}
                    alt="preview"
                    style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 8 }}
                  />
                </InputGroup.Text>
              )}
            </InputGroup>
            {editingId && !file && form.img && (
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                Current: <img src={`http://localhost:4000${form.img.replace('./', '/')}`} alt="current" style={{ width: 24, height: 24, borderRadius: 4 }} />
              </div>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Price</Form.Label>
            <Form.Control name="price" type="number" value={form.price} onChange={handleChange} required min={0} placeholder="0.00" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Category ID</Form.Label>
            <Form.Control name="category_id" value={form.category_id} onChange={handleChange} required placeholder="Category ID" />
          </Form.Group>
          <div className="d-grid gap-2">
            <Button type="submit" variant="primary" size="lg">
              {editingId ? 'Update' : 'Create'}
            </Button>
            {editingId && (
              <Button variant="secondary" size="lg" onClick={() => { setEditingId(null); setForm({ name: '', img: '', price: '', category_id: '' }); setFile(null); fileInputRef.current.value = ''; }}>
                Cancel
              </Button>
            )}
          </div>
        </Form>
        <h4 style={{ fontWeight: 'bold', margin: '32px 0 16px' }}>Product List</h4>
        <Table responsive bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Image</th>
              <th>Price</th>
              <th>Category ID</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={{ verticalAlign: 'middle' }}>{p.name}</td>
                <td style={{ verticalAlign: 'middle' }}>
                  <img src={`http://localhost:3000${p.img.replace('./', '/')}`} alt={p.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                </td>
                <td style={{ verticalAlign: 'middle' }}>{p.price}</td>
                <td style={{ verticalAlign: 'middle' }}>{p.category_id}</td>
                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                  <Button size="sm" variant="warning" className="me-2" onClick={() => handleEdit(p)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(p.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default ProductManager;