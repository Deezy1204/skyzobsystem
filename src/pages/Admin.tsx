import React, { useEffect, useState } from 'react'
import { Button, Card, Form, Row, Col, Table } from 'react-bootstrap'
import { addDoc, collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { ToastContainer, toast } from 'react-toastify'

const Admin: React.FC = () => {
  const [equipName, setEquipName] = useState('')
  const [equipDept, setEquipDept] = useState('technical')
  const [defaultQty, setDefaultQty] = useState(1)
  const [equipment, setEquipment] = useState<any[]>([])

  const loadEquipment = async () => {
    const snap = await getDocs(collection(db, 'equipment'))
    setEquipment(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })))
  }

  useEffect(() => {
    loadEquipment()
  }, [])

  const addEquipment = async () => {
    try {
      await addDoc(collection(db, 'equipment'), {
        name: equipName,
        department: equipDept,
        defaultQty,
      })
      toast.success('Equipment added')
      setEquipName('')
      setDefaultQty(1)
      loadEquipment()
    } catch (e: any) {
      toast.error(e.message || 'Failed to add equipment')
    }
  }

  return (
    <Card>
      <ToastContainer />
      <Card.Body>
        <h5 className="mb-3">Admin</h5>
        <Row className="g-3 align-items-end">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Equipment Name</Form.Label>
              <Form.Control value={equipName} onChange={(e) => setEquipName(e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Department</Form.Label>
              <Form.Select value={equipDept} onChange={(e) => setEquipDept(e.target.value)}>
                <option value="technical">Technical</option>
                <option value="marketing">Marketing</option>
                <option value="programming">Programming</option>
                <option value="admin">Admin</option>
                <option value="finance">Finance</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={2}>
            <Form.Group>
              <Form.Label>Default Qty</Form.Label>
              <Form.Control type="number" value={defaultQty} onChange={(e) => setDefaultQty(parseInt(e.target.value || '1', 10))} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Button onClick={addEquipment}>Add</Button>
          </Col>
        </Row>

        <hr className="my-4" />

        <h6>Equipment List</h6>
        <Table hover responsive size="sm">
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Default Qty</th>
            </tr>
          </thead>
          <tbody>
            {equipment.map((e) => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td className="text-capitalize">{e.department}</td>
                <td>{e.defaultQty}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}

export default Admin
