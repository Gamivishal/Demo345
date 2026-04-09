import React from "react"

export const SR_AUTO_FIELD = "__sr_auto__"

export const getNextSortState = (currentColumn, currentDirection, nextColumn) => {
  if (!nextColumn) {
    return {
      sortColumn: currentColumn,
      sortColumnDir: currentDirection,
    }
  }

  if (currentColumn === nextColumn) {
    return {
      sortColumn: currentColumn,
      sortColumnDir: currentDirection === "asc" ? "desc" : "asc",
    }
  }

  return {
    sortColumn: nextColumn,
    sortColumnDir: "asc",
  }
}

export const renderSortableHeaderButton = ({
  label,
  fieldName,
  onClick,
  activeSortColumn,
  sortColumnDir,
}) => {
  const isActiveSort = activeSortColumn === fieldName
  const arrowLabel = isActiveSort ? (sortColumnDir === "desc" ? " \u2193" : " \u2191") : ""

  return React.createElement(
    "button",
    {
      type: "button",
      onClick: () => onClick?.(fieldName),
      style: {
        background: "transparent",
        border: 0,
        color: "inherit",
        display: "block",
        width: "100%",
        minHeight: "100%",
        padding: 0,
        margin: 0,
        font: "inherit",
        fontWeight: isActiveSort ? 700 : "inherit",
        textAlign: "inherit",
        cursor: "pointer",
        boxSizing: "border-box",
      },
    },
    `${label}${arrowLabel}`
  )
}

export const createSortableColumn = ({
  label,
  field,
  onClick,
  activeSortColumn,
  sortColumnDir,
}) => {
  return {
    label: renderSortableHeaderButton({
      label,
      fieldName: field,
      onClick,
      activeSortColumn,
      sortColumnDir,
    }),
    field,
    sort: "disabled",
  }
}

export const buildServerSortColumns = ({
  columns = [],
  onSort,
  activeSortColumn,
  sortColumnDir,
}) => {
  return (columns || []).map(column => {
    const isSortable = column?.sort !== "disabled" && Boolean(column?.field)

    if (!isSortable) {
      return {
        ...column,
        sort: "disabled",
      }
    }

    return createSortableColumn({
      label: column.label,
      field: column.field,
      onClick: onSort,
      activeSortColumn,
      sortColumnDir,
    })
  })
}

export const withAutoSrColumn = ({ columns = [], rows = [] }) => {
  const normalizedColumns = (columns || []).filter(column => column?.field !== SR_AUTO_FIELD)
  const normalizedRows = (rows || []).map(row => ({
    ...(row || {}),
    [SR_AUTO_FIELD]: "",
  }))

  return {
    columns: [
      { label: "Sr.", field: SR_AUTO_FIELD, sort: "disabled" },
      ...normalizedColumns,
    ],
    rows: normalizedRows,
  }
}
