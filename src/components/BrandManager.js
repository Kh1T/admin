import React, { useEffect, useState, useRef } from 'react';
import { Card, Form, Button, Table, Alert, InputGroup } from 'react-bootstrap';

const BRAND_API = 'http://localhost:4000/api/brands';

function BrandManager() {
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState({ name: '', img: '' });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    fetch(BRAND_API).then(res => res.json()).then(setBrands);
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = e => setFile(e.target.files[0]);

  const handleSubmit = async e => {
  e.preventDefault();
  setMessage('');
  const formData = new FormData();
  formData.append('name', form.name);

  // If new file selected, append as file
  if (file) {
    formData.append('img', file);
  } else if (editingId && form.img) {
    // If editing and no new file, send previous img path as text
    formData.append('img', form.img);
  }

  const method = editingId ? 'PUT' : 'POST';
  const url = editingId ? `${BRAND_API}/${editingId}` : BRAND_API;
  try {
    const res = await fetch(url, {
      method,
      body: formData
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(editingId ? 'Brand updated!' : 'Brand created!');
      setForm({ name: '', img: '' });
      setFile(null);
      setEditingId(null);
      fileInputRef.current.value = '';
      fetch(BRAND_API).then(res => res.json()).then(setBrands);
    } else {
      setMessage(data.error || 'Error');
    }
  } catch {
    setMessage('Network error');
  }
};

  const handleEdit = b => {
    setForm({ name: b.name, img: b.img });
    setEditingId(b.id);
    setFile(null);
    setMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this brand?')) return;
    try {
      const res = await fetch(`${BRAND_API}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Brand deleted!');
        setBrands(brands.filter(b => b.id !== id));
      } else {
        setMessage('Delete failed');
      }
    } catch {
      setMessage('Network error');
    }
  };

  return (
    <Card className="brand-manager-card">
      <Card.Body>
        <h3 className="manager-title">
          {editingId ? 'Edit Brand' : 'Create Brand'}
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
              placeholder="Brand Name"
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
                    src={file ? URL.createObjectURL(file) : form.img}
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
                Current: <img src={form.img} alt="current" className="current-image-thumb" />
              </div>
            )}
          </Form.Group>
          <div className="form-buttons">
            <Button type="submit" variant="primary" className="btn-submit">
              {editingId ? 'Update Brand' : 'Create Brand'}
            </Button>
            {editingId && (
              <Button
                variant="secondary"
                className="btn-cancel"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: '', img: '' });
                  setFile(null);
                  fileInputRef.current.value = '';
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </Form>
        <h4 className="list-title">Brand List</h4>
        <div className="table-container">
          <Table responsive bordered hover className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Image</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map(b => (
                <tr key={b.id}>
                  <td>{b.name}</td>
                  <td>
                    <img
                      src={`http://localhost:3000${b.img.replace('./', '/')}`}
                      alt={b.name}
                      className="table-image"
                    />
                  </td>
                  <td className="text-center action-buttons">
                    <Button size="sm" variant="warning" className="btn-edit me-2" onClick={() => handleEdit(b)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" className="btn-delete" onClick={() => handleDelete(b.id)}>
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

export default BrandManager;