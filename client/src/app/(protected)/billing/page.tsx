import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Billing = () => {
  return (
    <div className="flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-10 text-center bg-clip-text ">
          Choose Your Billing Plan
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Free Plan Card */}
          <Card className="border-t-4 border-gray-300">

            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
                $0
                <span className="text-lg font-normal text-gray-500">
                  /month
                </span>
              </p>
              <ul className="space-y-3 text-gray-600 text-center mb-6">
                <li className="flex items-center justify-center">
                  <span className="text-green-500 mr-2">✓</span> Limited Usage
                  Quotas
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-green-500 mr-2">✓</span> Access on
                  grok.com & X
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-green-500 mr-2">✓</span> Mobile App
                  Access
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-red-500 mr-2">✗</span> Think Mode
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-red-500 mr-2">✗</span> DeepSearch Mode
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="default">Current Plan</Button>
            </CardFooter>
          </Card>

          {/* Premium Plan Card */}
          <Card className="border-t-4 border-blue-500">

            <CardHeader>
              <CardTitle>Premium Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-extrabold text-gray-900 mb-6 text-center">
                $TBD
                <span className="text-lg font-normal text-gray-500">
                  /month
                </span>
              </p>
              <ul className="space-y-3 text-gray-600 text-center mb-6">
                <li className="flex items-center justify-center">
                  <span className="text-green-500 mr-2">✓</span> Higher Usage
                  Quotas
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-green-500 mr-2">✓</span> Access on
                  grok.com & X
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-green-500 mr-2">✓</span> Mobile App
                  Access
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-green-500 mr-2">✓</span> Think Mode
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-green-500 mr-2">✓</span> DeepSearch Mode
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button>Upgrade to Premium</Button>
            </CardFooter>
          </Card>
        </div>

      </div>
    </div>
  );
};
export default Billing;
