import React from "react";
import { editMainSchematic, useEditorContext } from "./Editor";
import { StringEditor } from "./displayTools/StringEditor";
import { assignImm } from "../utils/data";
import { ButtonStandard } from "./EditorControls";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand } from "@fortawesome/free-solid-svg-icons";
import { computeModelBoundingBox } from "./ModelHelpers";
import { EditKvp } from "./CompDetails";

export const SchematicDetails: React.FC<{
}> = ({  }) => {

    let editCtx = useEditorContext();
    let { editorState, setEditorState } = editCtx;

    let snapshot = editorState.snapshotTemp ?? editorState.snapshot;
    let mainSchematic = snapshot.mainSchematic;

    function handleNameUpdate(end: boolean, value: string) {
        setEditorState(editMainSchematic(end, a => assignImm(a, { name: value })));
    }

    function handleParentCompDefIdUpdate(end: boolean, value: string) {
        setEditorState(editMainSchematic(end, a => assignImm(a, { parentCompDefId: value })));
    }

    function handleShowParentBoundary() {
        setEditorState(editMainSchematic(true, (a, _, snapshot) => {
            let compBbox = computeModelBoundingBox(snapshot, { excludePorts: true });
            return assignImm(a, { compBbox });
        }));
    }

    return <div className="flex flex-col border-b pb-1">
        <div>
            <div className="mt-2 mb-2 mx-2">Schematic: <b>{mainSchematic.name}</b></div>
            <div className="mx-2">
                <EditKvp label={'Id'}><code>{mainSchematic.id}</code></EditKvp>
                <EditKvp label={'Name'}><StringEditor className="bg-slate-100 rounded flex-1" value={mainSchematic.name} update={handleNameUpdate} /></EditKvp>
                <EditKvp label={'Parent Def Id'}><code>{mainSchematic.parentCompDefId}</code></EditKvp>
            </div>

            {mainSchematic.parentCompDefId && <ButtonStandard onClick={handleShowParentBoundary} className="mx-2 my-1">
                <FontAwesomeIcon icon={faExpand} className="mr-2" />
                Reset Boundary
            </ButtonStandard>}
        </div>
    </div>;
};