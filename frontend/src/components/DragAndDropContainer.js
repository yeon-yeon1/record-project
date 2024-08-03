import React from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import RichTextEditor from "./RichTextEditor";

const DragAndDropContainer = ({ sections, setSections }) => {
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections} strategy={verticalListSortingStrategy}>
        {sections.map((section, index) => (
          <SortableItem key={section.id} id={section.id}>
            <RichTextEditor
              initialValue={section.content || [{ type: "paragraph", children: [{ text: "" }] }]}
              onChange={(newContent) => {
                const newSections = [...sections];
                newSections[index].content = newContent;
                setSections(newSections);
              }}
            />
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
};

export default DragAndDropContainer;
