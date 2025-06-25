import CourseDetailsTab from "./CourseDetailsTab";

const CourseContent = ({ course, isPurchased, onPurchase }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2">
          <CourseDetailsTab course={course} isPurchased={isPurchased} onPurchase={onPurchase} />
        </div>
        <div className="lg:col-span-1">{/* Space for additional info or ads */}</div>
      </div>
    </div>
  );
};

export default CourseContent;