import React, { useMemo } from "react"
import {
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Form,
  Input,
  Label,
  Row,
  Spinner,
} from "reactstrap"

const RoleForm = ({
  title,
  formError,
  formData,
  menuOptions,
  saving,
  onChange,
  onIsAdminToggle,
  onSelectedMenuChange,
  onSubmit,
  onClose,
}) => {
  const ROOT_KEY = "0"

  const menuById = useMemo(() => {
    const map = new Map()
    ;(menuOptions || []).forEach(menu => {
      const id = String(menu.id)
      const parentId = String(menu.parentId ?? 0)

      map.set(id, {
        ...menu,
        id,
        parentId,
      })
    })
    return map
  }, [menuOptions])

  const childrenByParent = useMemo(() => {
    const map = new Map()
    Array.from(menuById.values()).forEach(menu => {
      const list = map.get(menu.parentId) || []
      list.push(menu)
      map.set(menu.parentId, list)
    })
    return map
  }, [menuById])

  const selectedSetFromProps = useMemo(() => {
    return new Set(
      (formData.selectedMenu || "")
        .split(",")
        .map(value => value.trim())
        .filter(value => value !== "")
    )
  }, [formData.selectedMenu])

  const getDescendantIds = id => {
    const result = []
    const stack = [String(id)]

    while (stack.length) {
      const currentId = stack.pop()
      const children = childrenByParent.get(currentId) || []
      children.forEach(child => {
        result.push(child.id)
        stack.push(child.id)
      })
    }

    return result
  }

  const getAncestorIds = id => {
    const result = []
    let current = menuById.get(String(id))

    while (current && current.parentId !== ROOT_KEY) {
      result.push(current.parentId)
      current = menuById.get(current.parentId)
    }

    return result
  }

  const handleMenuToggle = (menuId, checked) => {
    const id = String(menuId)
    const nextSet = new Set(selectedSetFromProps)
    const descendants = getDescendantIds(id)

    if (checked) {
      nextSet.add(id)
      descendants.forEach(childId => nextSet.add(childId))
    } else {
      nextSet.delete(id)
      descendants.forEach(childId => nextSet.delete(childId))
    }

    const ancestors = getAncestorIds(id)
    ancestors.forEach(parentId => {
      const directChildren = childrenByParent.get(parentId) || []
      const allChildrenSelected =
        directChildren.length > 0 &&
        directChildren.every(child => nextSet.has(child.id))

      if (allChildrenSelected) {
        nextSet.add(parentId)
      } else {
        nextSet.delete(parentId)
      }
    })

    const nextValue = Array.from(nextSet)
      .sort((a, b) => Number(a) - Number(b))
      .join(",")

    console.log("Menu selected IDs:", nextValue)
    onSelectedMenuChange(nextValue)
  }

  const renderMenuNode = (menu, level = 0) => {
    const children = childrenByParent.get(menu.id) || []
    const checkboxId = `role-menu-${menu.id}`
    const isChecked = selectedSetFromProps.has(menu.id)

    return (
      <div key={menu.id} style={{ paddingLeft: level * 20 }}>
        <div className="form-check mb-2">
          <input
            id={checkboxId}
            type="checkbox"
            className="form-check-input"
            checked={isChecked}
            onChange={e => e.preventDefault()}
            onClick={() => handleMenuToggle(menu.id, !isChecked)}
          />
          <label htmlFor={checkboxId} className="form-check-label ms-2">
            {menu.name}
          </label>
        </div>

        {children.length > 0 && (
          <div className="mb-1">
            {children.map(child => renderMenuNode(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  const rootMenus = childrenByParent.get(ROOT_KEY) || []

  return (
    <Card className="mb-4 app-form-card">
      <CardHeader className="bg-white d-flex align-items-center justify-content-between">
        <h5 className="mb-0">{title}</h5>
        <Button color="link" className="p-0" type="button" onClick={onClose}>
          Close
        </Button>
      </CardHeader>
      <CardBody className="app-form-body">
        {formError ? <Alert color="danger">{formError}</Alert> : null}
        <Form onSubmit={onSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Label>Role Name<span style={{ color: "red" }}>*</span></Label>
              <Input
                name="name"
                value={formData.name}
                onChange={onChange}
                placeholder="Enter role name"
              />
              <div className="form-check mt-3">
                <input
                  id="isAdmin"
                  name="isAdmin"
                  type="checkbox"
                  className="form-check-input"
                  checked={Boolean(formData.isAdmin)}
                  onChange={e => e.preventDefault()}
                  onClick={onIsAdminToggle}
                />
                <label htmlFor="isAdmin" className="form-check-label ms-2">
                  Is Admin
                </label>
              </div>
            </Col>

            <Col md={12}>
              <Label>Selected Menu<span style={{ color: "red" }}>*</span></Label>
              <div className="border rounded p-3" style={{ maxHeight: 280, overflowY: "auto" }}>
                {rootMenus.length > 0 ? (
                  rootMenus.map(menu => renderMenuNode(menu))
                ) : (
                  <div className="text-muted">No menu items found</div>
                )}
              </div>
            </Col>
          </Row>

          <div className="app-form-actions">
            <Button color="light" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button color="success" type="submit" disabled={saving}>
              {saving ? <Spinner size="sm" className="me-2" /> : null}
              Save
            </Button>
          </div>
        </Form>
      </CardBody>
    </Card>
  )
}

export default RoleForm
