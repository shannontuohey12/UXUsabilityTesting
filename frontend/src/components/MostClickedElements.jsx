function MostClickedElements({ mostClickedElements }) {
    return (
        <>
            {mostClickedElements.length > 0 && (
                <section className="panel panel-outlined">
                    <h2>Most Clicked Elements</h2>
                    <p className="card-description">
                        Elements participants interacted with most often
                    </p>

                    <div className="clicked-elements">
                        {mostClickedElements.slice(0, 5).map((item, index) => (
                            <div
                                className="clicked-element-row"
                                key={`${item.element}-${index}`}
                            >
                                <div className="element-info">
                                    <span className="element-rank">{index + 1}</span>
                                    <span className="element-name">{item.element}</span>
                                </div>
                                <strong>{item.clicks}</strong>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}

export default MostClickedElements;