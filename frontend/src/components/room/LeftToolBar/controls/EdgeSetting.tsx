import {SquareDashedTopSolid,SquareDashed} from "lucide-react"
import { useToolSettings } from "../../../../context/ToolBarLeftContext"
import { useEditElements } from "../../Multicursor/hooks/useEditElements";
export default function EdgeSetting() {
  const { edgeStyle, setEdgeStyle,selectedEle } = useToolSettings();
  const {handleEdgeUpdatation}=useEditElements();

  return (
    <div className="mt-2">
      <p className="mb-2 text-sm text-gray-300 ">Edges</p>
      <div className="flex gap-2">
        <div 
        onClick={() => {setEdgeStyle("sharp")
          if(selectedEle) handleEdgeUpdatation("sharp")
        }}
          className={`icon-background p-0.5 rounded ${edgeStyle === "sharp" ? "bg-[rgb(65,65,137)]" : "bg-[rgb(51,52,55)]"} `}
        >
          <SquareDashedTopSolid />
        </div>
        <div 
          onClick={() => {setEdgeStyle("rounded")
            if(selectedEle)handleEdgeUpdatation("rounded")
          }}
          className={`icon-background p-0.5 rounded ${edgeStyle === "rounded" ? "bg-[rgb(65,65,137)]" : "bg-[rgb(51,52,55)]"} `}
        >
          <SquareDashed />
        </div>
      </div>
    </div>
  )
}
