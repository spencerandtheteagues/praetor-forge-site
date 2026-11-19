import { Fragment, cloneElement, isValidElement } from "react";

/**
 * Splits a phrase into words, each with a decorative stepped bronze side wall
 * (drawn by CSS ::before / ::after from data-text with empty alt text) behind a
 * metallic face. Words remain plain DOM text exactly once, so innerText and
 * screen readers read each phrase a single time.
 */
function raise(node, path) {
  if (typeof node === "number") return raise(String(node), path);
  if (typeof node === "string") {
    // Hyphenated compounds become separate pieces so narrow screens may wrap
    // after the hyphen, exactly as plain text would.
    return node.split(/( +)/).flatMap((part, i) => {
      if (!part || part.trim() === "") return part ? [part] : [];
      return part.split(/(?<=-)(?=.)/).map((piece, j) => (
        <span key={`${path}-${i}-${j}`} className="r3d" data-text={piece}>
          <span className="r3d-face">{piece}</span>
        </span>
      ));
    });
  }
  if (Array.isArray(node)) return node.map((child, i) => raise(child, `${path}.${i}`));
  if (isValidElement(node)) {
    if (node.type === Fragment) return raise(node.props.children, path);
    if (node.props.children == null) return node;
    return cloneElement(node, { key: node.key ?? path }, raise(node.props.children, path));
  }
  return node;
}

export default function Raised({ children }) {
  return raise(children, "r");
}
