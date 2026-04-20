import { fetchTemplates } from "../api";

const [templates, setTemplates] = useState([]);

export default function xxxEditorScreen({
    activeItem,
    setActiveItem,
    onCancel,
    onRefresh
}) {

    useEffect(() => {
        fetchTemplates("trip segment tour note").then(setTemplates).catch(console.error);
    }, []);


    return (
        // Template Button 
        <div>
            < div className="template-buttons" >
                {
                    templates.map(t => (
                        <button
                            key={t.id}
                            className="template-button"
                            onClick={() => {
                                setActiveItem(prev => ({
                                    ...prev,
                                    note: (prev.note || "") + "\n\n" + t.template
                                }));
                            }}
                        >
                            {t.icon} {t.name}
                        </button>
                    ))
                }
            </div >
            <div className="markdown-text">
                <textarea
                    value={activeItem.note || ""}
                    onChange={e =>
                        setActiveItem(prev => ({ ...prev, note: e.target.value }))
                    }
                />
            </div>
        </div>
    );
}


/*
<style>
.template-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.template-button {
  padding: 6px 10px;
  border-radius: 4px;
  background: var(--color-accent);
  border: 1px solid var(--color-border);
  cursor: pointer;
  font-size: 13px;
}

.template-button:hover {
  background: var(--color-accent-hover);
}

</style>
*/