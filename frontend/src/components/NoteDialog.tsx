import React, {useState} from 'react';
import {
    Dialog,
    DialogContent, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {TableCell} from "@/components/ui/table.tsx";

type Props = {
    note:string | null
}
const NoteDialog = ({ note }: Props) => {
    const [open, setOpen] = useState(false);

    if (!note || note.length === 0) {
        return <TableCell>Нету заметки</TableCell>;
    }

    if (note.length <= 20) {
        return <TableCell>{note}</TableCell>;
    }

    return (
        <TableCell>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="secondary">
                        {note.slice(0, 20)}...
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[900px]">
                    <DialogHeader>
                        <DialogTitle>Заметка</DialogTitle>
                    </DialogHeader>
                    <div className="whitespace-pre-wrap break-words">
                        {note}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setOpen(false)}>Закрыть</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TableCell>
    );
};


export default NoteDialog;