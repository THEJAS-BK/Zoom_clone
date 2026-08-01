import { useEffect, useState } from "react";
import { useToolSettings } from "../../../../context/ToolBarLeftContext";

import { colorShades, transparentPattern } from "../tools/colors";
import { useEditElements } from "../../Multicursor/hooks/useEditElements";
export default function ColorGrid({
  isMostUsedColorsNeeded,
}: {
  isMostUsedColorsNeeded: boolean;
}) {
  const {
    strokeColor,
    setStrokeColor,
    setShadeIdx,
    setFillColor,
    fillColor,
    selectedEle,
  } = useToolSettings();
  const { handleEditShapeOutlineColor, handleEditShapeFillColor } =
    useEditElements();
  const [colorList, setColorList] = useState<{ char: string; color: string }[]>(
    [],
  );
  const [selectedChar, setSelectedChar] = useState<string>("");
  const [currentShade, setCurrentShade] = useState([""]);

  const [hexCode, setHexcode] = useState<string>("");
  const [isHexInputActive, setIsHexInputActive] = useState(false);

  const isValidHex = (hex: string): boolean =>
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{8})$/.test(
      hex,
    );

  const handleHexCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = isValidHex(e.target.value);
    setHexcode(e.target.value);
    if (val) {
      if(!isMostUsedColorsNeeded){
        setFillColor(e.target.value)
        return;
      }
      setStrokeColor(e.target.value);
    }
  };
  const handleHexKeyDown=(e: React.KeyboardEvent<HTMLInputElement>)=>{
    if(e.key==="Enter"){
      const val = isValidHex(hexCode);
    if (val) {
      if(!isMostUsedColorsNeeded){
        setFillColor(hexCode)
        return;
      }
      setStrokeColor(hexCode);
    }
    }
  }

  useEffect(() => {
    setCurrentShade(colorShades[selectedChar] ?? []);
  }, [selectedChar]);

  useEffect(() => {
    const activeColor = isMostUsedColorsNeeded ? strokeColor : fillColor;
    const val = Object.entries(colorShades).find(([char, ele]) => {
      return ele[ele.length - 1] === activeColor;
    });
    if (!val) return;
    const shades = colorShades[val[0]] ?? [];
    setCurrentShade(shades);
  }, [strokeColor, fillColor, isMostUsedColorsNeeded]);

  useEffect(() => {
    const handleQuickColorChange = (e: KeyboardEvent) => {
      if (isHexInputActive) return;
      const shadeCodeMap: Record<string, number> = {
        Digit1: 0,
        Digit2: 1,
        Digit3: 2,
        Digit4: 3,
        Digit5: 4,
      };

      if (e.shiftKey && shadeCodeMap[e.code] !== undefined) {
        const index = shadeCodeMap[e.code];
        setShadeIdx(index);

        const shade = colorShades[selectedChar]?.[index];
        if (shade) setStrokeColor(shade);
        return;
      }

      const match = colorList.find((c) => c.char === e.key);
      if (!match) return;
      {
        isMostUsedColorsNeeded
          ? setStrokeColor(match.color)
          : setFillColor(match.color);
      }
      setSelectedChar(match.char);
    };

    window.addEventListener("keydown", handleQuickColorChange);
    return () => {
      window.removeEventListener("keydown", handleQuickColorChange);
    };
  }, [setStrokeColor, selectedChar, fillColor, setFillColor]);

  useEffect(() => {
    const temp = Object.entries(colorShades).map(([char, shades]) => ({
      char,
      color: shades[shades.length - 1],
    }));
    setColorList(temp);
  }, [setShadeIdx]);

  return (
    <div
      className={`absolute text-white left-[110%] w-[210px] top-5 flex flex-col justify-center rounded-2xl bg-[#1f1f2b] shadow-xl p-5 z-20`}
    >
      {isMostUsedColorsNeeded && (
        <>
          <p className="mb-2 text-sm font-medium text-white ">Stroke</p>
          <span className="mb-2 text-[12px]  text-white ">
            most Used custom colors
          </span>
          <div
            style={{ backgroundColor: strokeColor }}
            className="h-6 w-6 rounded cursor-pointer "
          ></div>
        </>
      )}

      <span className="mb-1 text-[12px]  text-white mt-4">Colors</span>
      <div className="grid grid-cols-5 gap-1 w-fit">
        {colorList.map((stroke) => (
          <div
            key={stroke.color}
            style={{ backgroundColor: stroke.color }}
            className={`w-7 h-7 rounded cursor-pointer ${
              (isMostUsedColorsNeeded ? strokeColor : fillColor) ===
              stroke.color
                ? "border-2 border-purple-500"
                : "border border-transparent"
            }`}
            onClick={() => {
              if (!isMostUsedColorsNeeded) {
                setFillColor(stroke.color);
                setSelectedChar(stroke.char);
                handleEditShapeFillColor(stroke.color);
                return;
              }
              setStrokeColor(stroke.color);
              setSelectedChar(stroke.char);
              if (selectedEle) handleEditShapeOutlineColor(stroke.color);
            }}
          >
            <span className="text-sm flex items-end mt-2 ml-0.5">
              {stroke.char}
            </span>
          </div>
        ))}

        {!isMostUsedColorsNeeded && (
          <div
            style={transparentPattern}
            className={`w-6 h-6 rounded cursor-pointer `}
            onClick={() => {
              setFillColor("transparent");
              handleEditShapeFillColor("transparent");
            }}
          />
        )}
      </div>

     {currentShade&&<> <span className="mb-1 text-[12px]  text-white mt-4">Shades</span>
      <div className="grid grid-cols-5 gap-1 w-fit">
        {currentShade.map((color, idx) => (
          <div
            key={idx}
            style={{ backgroundColor: color }}
            className={`w-6 h-6 rounded cursor-pointer ${
              strokeColor === color || fillColor === color
                ? "border-2 border-purple-500"
                : "border border-transparent"
            }`}
            onClick={() => {
              setShadeIdx(idx);
              if (!isMostUsedColorsNeeded) {
                setFillColor(color);
                handleEditShapeFillColor(color);
                return;
              }
              setStrokeColor(color);
              if (selectedEle) handleEditShapeOutlineColor(color);
            }}
          />
        ))}
      </div>
     </>
     }

      <span className="mb-1 text-[12px]  text-white mt-4">Hex Code</span>
      <div className="flex  border border-gray-500 focus:outline-none w-[95%] ">
        <input
          className="text-white bg-[#1f1f2b] p-1 w-full "
          type="text"
          name=""
          placeholder="#121212"
          id=""
          value={hexCode}
          onChange={(e) => handleHexCode(e)}
          onKeyDown={(e)=>handleHexKeyDown(e)}
          onFocus={() => setIsHexInputActive(true)}
          onBlur={() => setIsHexInputActive(false)}
          maxLength={7}
        />
      </div>
    </div>
  );
}
