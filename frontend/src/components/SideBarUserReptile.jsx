// SideBarUserReptile.jsx
import React from "react";
import { ListGroup } from "react-bootstrap";

const SideBarUserReptile = ({ menuItems }) => {
  return (
    <div
      className="bg-white shadow d-none d-lg-flex flex-column"
      style={{
        width: "16rem",
        height: "calc(100vh - 12rem)",
        position: "sticky",
        top: 0,
      }}
    >
      {/* Sidebar Header */}
      <div className="p-3 border-bottom">
        <div className="d-flex align-items-center">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center me-2 text-white fw-bold"
            style={{ width: "2rem", height: "2rem", backgroundColor: "#20c997" }}
          >
            MD
          </div>
          <span className="fw-semibold">Măng Đinh</span>
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="p-3 overflow-auto flex-grow-1">
        {menuItems.map((section, index) => (
          <div key={index} className="mb-4">
            <h6 className="fw-semibold text-secondary small mb-2">{section.title}</h6>
            <ListGroup variant="flush">
              {section.items.map((item, itemIndex) => (
                <ListGroup.Item
                  key={itemIndex}
                  action
                  className="border-0 py-1 px-2 text-secondary small"
                  style={{ backgroundColor: "transparent" }}
                >
                  {item}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SideBarUserReptile;
