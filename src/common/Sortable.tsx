import { useDroppable, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useSortable, rectSortingStrategy, SortableContext, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import React, { DetailedHTMLProps, HTMLAttributes } from "react";
import { CSS } from "@dnd-kit/utilities";

interface SortableContainerProps {
    items: ({ name: string } & object)[]
    setItems: Function
    children: React.ReactNode
    style?: React.CSSProperties
    className?: string
}
export function SortableContainer(props: SortableContainerProps) {
    const { setNodeRef } = useDroppable({ id: "dummy" });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                delay: 150,
                tolerance: 5,
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const handleDragEnd = ({ active, over }: DragEndEvent) => {
        if (over && active.id !== over.id) {
            props.setItems(arrayMove(
                props.items,
                active.data.current!.sortable.index,
                over.data.current?.sortable.index || 0
            ));
        }
    };

    return (
        <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd} >
            <SortableContext
                items={props.items.map(item => item.name)}
                strategy={rectSortingStrategy}>
                <div ref={setNodeRef}>
                    <div
                        style={props.style}
                        className={props.className}>
                        {props.children}
                    </div>
                </div>
            </SortableContext>
        </DndContext>
    );
}


interface SortableItemProps {
    name: number | string
}
export function SortableItem(props: SortableItemProps & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.name });

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={{
                transition,
                transform: CSS.Transform.toString(transform),
                zIndex: transform?.x !== 0 && transform?.y !== 0 ? 200 : undefined,
                userSelect: "none",
                boxSizing: "border-box",
            }}>
            <div {...props} />
        </div>
    );
};