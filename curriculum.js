/**
 * Johnly-math curriculum tree.
 * Keep curriculum data separate from application/authentication logic so new
 * units can be added without rewriting the recursive tree renderer.
 */

export const curriculum = [
  {
    id: "grade-10",
    label: "10",
    kind: "grade",
    children: [
      {
        id: "grade-10-sets-and-logic",
        label: "01 Sets and Logic",
        kind: "folder",
        children: [
          {
            id: "grade-10-introduction-to-sets",
            label: "Introduction to Sets",
            kind: "folder",
            children: [
              {
                id: "grade-10-introduction-to-sets-1",
                label: "Introduction to Sets 1",
                kind: "lesson-folder",
                children: [
                  {
                    id: "grade-10-sets-1-learning",
                    label: "Learning",
                    kind: "page",
                    section: "learning",
                  },
                  {
                    id: "grade-10-sets-1-homework",
                    label: "Homework",
                    kind: "page",
                    section: "homework",
                  },
                ],
              },
              {
                id: "grade-10-introduction-to-sets-2",
                label: "Introduction to Sets 2",
                kind: "lesson-folder",
                children: [
                  {
                    id: "grade-10-sets-2-learning",
                    label: "Learning",
                    kind: "page",
                    section: "learning",
                  },
                  {
                    id: "grade-10-sets-2-homework",
                    label: "Homework",
                    kind: "page",
                    section: "homework",
                  },
                ],
              },
              {
                id: "grade-10-introduction-to-sets-3",
                label: "Introduction to Sets 3",
                kind: "lesson-folder",
                children: [
                  {
                    id: "grade-10-sets-3-learning",
                    label: "Learning",
                    kind: "page",
                    section: "learning",
                  },
                  {
                    id: "grade-10-sets-3-homework",
                    label: "Homework",
                    kind: "page",
                    section: "homework",
                  },
                ],
              },
              {
                id: "grade-10-introduction-to-sets-4",
                label: "Introduction to Sets 4",
                kind: "lesson-folder",
                children: [
                  {
                    id: "grade-10-sets-4-learning",
                    label: "Learning",
                    kind: "page",
                    section: "learning",
                  },
                  {
                    id: "grade-10-sets-4-homework",
                    label: "Homework",
                    kind: "page",
                    section: "homework",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "grade-10-geometry",
        label: "02 Geometry",
        kind: "folder",
        children: [
          {
            id: "grade-10-geometry-outline",
            label: "Course outline coming soon",
            kind: "notice",
            message:
              "The Geometry directory is ready. Its units and lessons have not been added yet.",
          },
        ],
      },
    ],
  },
  {
    id: "grade-11",
    label: "11",
    kind: "grade",
    children: [
      {
        id: "grade-11-outline",
        label: "Course outline coming soon",
        kind: "notice",
        message:
          "The Grade 11 directory is ready. Its course units and lessons have not been added yet.",
      },
    ],
  },
  {
    id: "grade-12",
    label: "12",
    kind: "grade",
    children: [
      {
        id: "grade-12-outline",
        label: "Course outline coming soon",
        kind: "notice",
        message:
          "The Grade 12 directory is ready. Its course units and lessons have not been added yet.",
      },
    ],
  },
];

/** Build an accessible, recursively nested folder tree. */
export function initCurriculum({ onSelect }) {
  const treeRoot = document.getElementById("curriculum-tree");

  if (!treeRoot) {
    console.error('Johnly-math: missing element with id="curriculum-tree".');
    return;
  }

  treeRoot.replaceChildren();
  treeRoot.setAttribute("role", "tree");
  treeRoot.setAttribute("aria-label", "Mathematics course directory");

  function createGroup(nodes, parentPath = [], depth = 0) {
    const group = document.createElement("ul");
    group.className = depth === 0 ? "tree-group tree-root" : "tree-group";
    group.setAttribute("role", "group");
    group.dataset.depth = String(depth);

    for (const node of nodes) {
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      const item = document.createElement("li");
      item.className = "tree-item";
      item.setAttribute("role", "none");

      const button = document.createElement("button");
      button.type = "button";
      button.className = hasChildren ? "tree-toggle" : "tree-leaf";
      button.setAttribute("role", "treeitem");
      button.setAttribute("aria-level", String(depth + 1));
      button.dataset.nodeId = node.id;
      button.dataset.depth = String(depth);

      const chevron = document.createElement("span");
      chevron.className = "tree-chevron";
      chevron.setAttribute("aria-hidden", "true");
      chevron.textContent = hasChildren ? "›" : "";
      button.append(chevron);

      const folderMark = document.createElement("span");
      folderMark.className = hasChildren ? "tree-folder-mark" : "tree-leaf-mark";
      folderMark.setAttribute("aria-hidden", "true");
      folderMark.textContent = hasChildren ? "▰" : "·";
      button.append(folderMark);

      const label = document.createElement("span");
      label.className = "tree-label";
      label.textContent = node.label;
      button.append(label);

      const currentPath = [...parentPath, node];
      let childGroup = null;

      if (hasChildren) {
        childGroup = createGroup(node.children, currentPath, depth + 1);
        childGroup.id = `${node.id}-children`;
        childGroup.hidden = true;
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", childGroup.id);
        button.addEventListener("click", () => {
          const isExpanded = button.getAttribute("aria-expanded") === "true";
          button.setAttribute("aria-expanded", String(!isExpanded));
          button.classList.toggle("is-expanded", !isExpanded);
          childGroup.hidden = isExpanded;
        });
      } else {
        button.addEventListener("click", () => {
          treeRoot.querySelectorAll(".tree-leaf.is-selected").forEach((selected) => {
            selected.classList.remove("is-selected");
            selected.removeAttribute("aria-current");
          });
          button.classList.add("is-selected");
          button.setAttribute("aria-current", "page");
          if (typeof onSelect === "function") {
            onSelect(node, currentPath);
          }
        });
      }

      // Keyboard support follows common tree-view behavior while preserving native buttons.
      button.addEventListener("keydown", (event) => {
        const visibleItems = Array.from(treeRoot.querySelectorAll('[role="treeitem"]'))
          .filter((treeItem) => !treeItem.closest("[hidden]"));
        const currentIndex = visibleItems.indexOf(button);
        const focusItem = (index) => {
          if (index >= 0 && index < visibleItems.length) visibleItems[index].focus();
        };

        if (event.key === "ArrowDown") {
          event.preventDefault();
          focusItem(currentIndex + 1);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          focusItem(currentIndex - 1);
        } else if (event.key === "Home") {
          event.preventDefault();
          focusItem(0);
        } else if (event.key === "End") {
          event.preventDefault();
          focusItem(visibleItems.length - 1);
        } else if (event.key === "ArrowRight" && hasChildren) {
          event.preventDefault();
          if (button.getAttribute("aria-expanded") === "false") button.click();
          else childGroup.querySelector('[role="treeitem"]')?.focus();
        } else if (event.key === "ArrowLeft") {
          if (hasChildren && button.getAttribute("aria-expanded") === "true") {
            event.preventDefault();
            button.click();
          } else {
            const parentGroup = item.parentElement;
            const parentItem = parentGroup?.parentElement?.closest("li");
            const parentButton = parentItem?.querySelector(':scope > button[role="treeitem"]');
            if (parentButton) {
              event.preventDefault();
              parentButton.focus();
            }
          }
        }
      });

      item.append(button);
      if (childGroup) item.append(childGroup);
      group.append(item);
    }

    return group;
  }

  treeRoot.append(createGroup(curriculum));
}
